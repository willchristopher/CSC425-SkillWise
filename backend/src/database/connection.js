/**
 * PostgreSQL database connection and helpers
 * Provides connection pooling, query execution, and transaction support
 */

const { Pool } = require('pg');
const pino = require('pino');

const logger = pino({
  name: 'skillwise-db',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  // Fallback configuration if DATABASE_URL is not set
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Production SSL configuration
  ...(process.env.NODE_ENV === 'production' && {
    ssl: {
      rejectUnauthorized: false
    }
  }),
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_SIZE) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool events
pool.on('connect', () => {
  logger.info('New database client connected');
});

pool.on('error', (err) => {
  logger.error('Database pool error:', err);
  // Only exit on critical connection errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    logger.fatal('Database connection lost - shutting down');
    process.exit(1);
  }
});

pool.on('remove', () => {
  logger.info('Database client removed from pool');
});

// Test database connection
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    logger.info('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (err) {
    logger.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (err) {
    logger.error('Error closing database pool:', err);
  }
};

// Query helper function
const query = async (text, params = []) => {
  const start = Date.now();
  const queryId = Math.random().toString(36).substring(2, 15);
  
  try {
    logger.debug(`[${queryId}] Executing query:`, { 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      paramCount: params.length 
    });
    
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`[${queryId}] Query completed:`, { 
      duration: `${duration}ms`, 
      rows: result.rowCount,
      command: result.command 
    });
    
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error(`[${queryId}] Query failed:`, { 
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: err.message,
      duration: `${duration}ms`,
      code: err.code,
      detail: err.detail
    });
    throw err;
  }
};

// Transaction helper with automatic rollback
const withTransaction = async (callback) => {
  const client = await pool.connect();
  const transactionId = Math.random().toString(36).substring(2, 15);
  
  try {
    logger.debug(`[${transactionId}] Starting transaction`);
    await client.query('BEGIN');
    
    // Create a query function bound to this client
    const transactionQuery = async (text, params = []) => {
      const start = Date.now();
      try {
        const result = await client.query(text, params);
        const duration = Date.now() - start;
        logger.debug(`[${transactionId}] Transaction query:`, { 
          duration: `${duration}ms`, 
          rows: result.rowCount 
        });
        return result;
      } catch (err) {
        logger.error(`[${transactionId}] Transaction query failed:`, { 
          error: err.message,
          code: err.code 
        });
        throw err;
      }
    };
    
    // Execute the callback with the transaction query function
    const result = await callback(transactionQuery);
    
    await client.query('COMMIT');
    logger.debug(`[${transactionId}] Transaction committed successfully`);
    
    return result;
  } catch (err) {
    logger.warn(`[${transactionId}] Transaction failed, rolling back:`, { 
      error: err.message,
      code: err.code 
    });
    
    try {
      await client.query('ROLLBACK');
      logger.debug(`[${transactionId}] Transaction rolled back successfully`);
    } catch (rollbackErr) {
      logger.error(`[${transactionId}] Rollback failed:`, { 
        error: rollbackErr.message 
      });
    }
    
    throw err;
  } finally {
    client.release();
    logger.debug(`[${transactionId}] Database client released`);
  }
};

// Additional helper functions
const getClient = async () => {
  return await pool.connect();
};

const healthCheck = async () => {
  try {
    const result = await query('SELECT version(), now() as current_time, current_database() as database');
    return {
      healthy: true,
      version: result.rows[0].version,
      currentTime: result.rows[0].current_time,
      database: result.rows[0].database,
      poolSize: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount
    };
  } catch (err) {
    return {
      healthy: false,
      error: err.message
    };
  }
};

module.exports = {
  // Pool instance for advanced usage
  pool,
  
  // Main helper functions
  query,
  withTransaction,
  
  // Additional utilities
  getClient,
  healthCheck,
  testConnection,
  closePool
};