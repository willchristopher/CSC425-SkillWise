// Main Express application setup with middleware and routing
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const pinoHttp = require('pino-http');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { Sentry } = require('./sentry');

// Import routes
const routes = require('./routes/index');

// Create Express app
const app = express();

// Sentry request handler (must be before all other middleware/routes)
if (Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.requestHandler());
}

// Create logger
const logger = pino({
  name: 'skillwise-api',
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Add request logging middleware
app.use(pinoHttp({
  logger,
  autoLogging: true,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}));

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      scriptSrc: ['\'self\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
    },
  },
}));

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  strict: true,
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Cookie parsing middleware (needed for refresh tokens)
app.use(cookieParser());


// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Debug Sentry test route
app.get('/debug/sentry', (req, res) => {
  throw new Error('Sentry test error (backend)');
});

// Mount API routes
app.use('/api', routes);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Sentry error handler (must be before any other error middleware)
if (Sentry && Sentry.Handlers) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global error handler (must be last)
app.use(errorHandler);

// Make logger available to other modules
app.set('logger', logger);

module.exports = app;
