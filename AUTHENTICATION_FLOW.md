# Authentication Flow Diagram and Description

## Overview
SkillWise uses a secure JWT (JSON Web Token) based authentication system with bcrypt password hashing and refresh token rotation for enhanced security.

---

## 🔐 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                    Database
       │                           │                           │
       │  POST /api/auth/register  │                           │
       │  {email, password,        │                           │
       │   firstName, lastName}    │                           │
       ├──────────────────────────>│                           │
       │                           │                           │
       │                           │ 1. Validate input         │
       │                           │    (Zod schema)           │
       │                           │                           │
       │                           │ 2. Check if email exists  │
       │                           ├──────────────────────────>│
       │                           │<──────────────────────────┤
       │                           │   SELECT * WHERE email    │
       │                           │                           │
       │                           │ 3. Hash password          │
       │                           │    bcrypt.hash(pwd, 12)   │
       │                           │                           │
       │                           │ 4. Store user             │
       │                           ├──────────────────────────>│
       │                           │   INSERT INTO users       │
       │                           │<──────────────────────────┤
       │                           │                           │
       │                           │ 5. Generate JWT tokens    │
       │                           │    - Access (15 min)      │
       │                           │    - Refresh (7 days)     │
       │                           │                           │
       │                           │ 6. Store refresh token    │
       │                           ├──────────────────────────>│
       │                           │   INSERT INTO tokens      │
       │                           │<──────────────────────────┤
       │                           │                           │
       │  {user, accessToken}      │                           │
       │  Set-Cookie: refreshToken │                           │
       │<──────────────────────────┤                           │
       │                           │                           │
       │ 7. Store accessToken      │                           │
       │    in localStorage        │                           │
       │                           │                           │
       │ 8. Redirect to Dashboard  │                           │
       │                           │                           │


┌─────────────────────────────────────────────────────────────────────────┐
│                            USER LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                    Database
       │                           │                           │
       │  POST /api/auth/login     │                           │
       │  {email, password}        │                           │
       ├──────────────────────────>│                           │
       │                           │                           │
       │                           │ 1. Find user by email     │
       │                           ├──────────────────────────>│
       │                           │<──────────────────────────┤
       │                           │   SELECT * WHERE email    │
       │                           │                           │
       │                           │ 2. Verify password        │
       │                           │    bcrypt.compare()       │
       │                           │    ✓ Match / ✗ Reject    │
       │                           │                           │
       │                           │ 3. Update last_login      │
       │                           ├──────────────────────────>│
       │                           │   UPDATE users            │
       │                           │<──────────────────────────┤
       │                           │                           │
       │                           │ 4. Generate new tokens    │
       │                           │    - Access (15 min)      │
       │                           │    - Refresh (7 days)     │
       │                           │                           │
       │                           │ 5. Store refresh token    │
       │                           ├──────────────────────────>│
       │                           │   INSERT INTO tokens      │
       │                           │<──────────────────────────┤
       │                           │                           │
       │  {user, accessToken}      │                           │
       │  Set-Cookie: refreshToken │                           │
       │<──────────────────────────┤                           │
       │                           │                           │
       │ 6. Store in localStorage  │                           │
       │ 7. Redirect to Dashboard  │                           │
       │                           │                           │


┌─────────────────────────────────────────────────────────────────────────┐
│                      PROTECTED ROUTE ACCESS FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                    Database
       │                           │                           │
       │  GET /api/users/profile   │                           │
       │  Authorization: Bearer    │                           │
       │  {accessToken}            │                           │
       ├──────────────────────────>│                           │
       │                           │                           │
       │                           │ 1. Extract token from     │
       │                           │    Authorization header   │
       │                           │                           │
       │                           │ 2. Verify JWT signature   │
       │                           │    jwt.verify(token)      │
       │                           │                           │
       │                           │ ✓ Valid                   │
       │                           │ ├─> Attach user to req    │
       │                           │ │   req.user = decoded    │
       │                           │ │                         │
       │                           │ │ 3. Execute route        │
       │                           │ │    handler              │
       │                           │ │                         │
       │  {userData}               │ │                         │
       │<──────────────────────────┤─┘                         │
       │                           │                           │
       │                           │ ✗ Invalid/Expired         │
       │                           │ ├─> Return 401            │
       │  401 Unauthorized          │ │                         │
       │<──────────────────────────┤─┘                         │
       │                           │                           │
       │ 4. Trigger token refresh  │                           │
       │    (if expired)           │                           │
       │                           │                           │


┌─────────────────────────────────────────────────────────────────────────┐
│                         TOKEN REFRESH FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                    Database
       │                           │                           │
       │  POST /api/auth/refresh   │                           │
       │  Cookie: refreshToken     │                           │
       ├──────────────────────────>│                           │
       │                           │                           │
       │                           │ 1. Extract refresh token  │
       │                           │    from httpOnly cookie   │
       │                           │                           │
       │                           │ 2. Verify token           │
       │                           │    jwt.verify()           │
       │                           │                           │
       │                           │ 3. Check token in DB      │
       │                           ├──────────────────────────>│
       │                           │   SELECT * FROM tokens    │
       │                           │<──────────────────────────┤
       │                           │   (check not revoked)     │
       │                           │                           │
       │                           │ 4. Generate new access    │
       │                           │    token (15 min)         │
       │                           │                           │
       │  {accessToken}            │                           │
       │<──────────────────────────┤                           │
       │                           │                           │
       │ 5. Update localStorage    │                           │
       │ 6. Retry failed request   │                           │
       │                           │                           │


┌─────────────────────────────────────────────────────────────────────────┐
│                            LOGOUT FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

    Frontend                    Backend                    Database
       │                           │                           │
       │  POST /api/auth/logout    │                           │
       │  Cookie: refreshToken     │                           │
       ├──────────────────────────>│                           │
       │                           │                           │
       │                           │ 1. Extract refresh token  │
       │                           │                           │
       │                           │ 2. Revoke token in DB     │
       │                           ├──────────────────────────>│
       │                           │   UPDATE refresh_tokens   │
       │                           │   SET is_revoked = true   │
       │                           │<──────────────────────────┤
       │                           │                           │
       │                           │ 3. Clear cookie           │
       │  Success + Clear Cookie   │                           │
       │<──────────────────────────┤                           │
       │                           │                           │
       │ 4. Clear localStorage     │                           │
       │ 5. Redirect to Login      │                           │
       │                           │                           │
```

---

## 🔑 Security Features

### 1. **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Storage**: Only password hash stored, never plaintext
- **Verification**: Server-side comparison using `bcrypt.compare()`

### 2. **JWT Token Strategy**
- **Access Token**: 
  - Lifespan: 15 minutes
  - Storage: Frontend localStorage
  - Transport: Authorization header (`Bearer {token}`)
  - Payload: `{ id, email, role }`

- **Refresh Token**:
  - Lifespan: 7 days
  - Storage: httpOnly cookie (XSS protection)
  - Transport: Automatic with requests
  - Database tracked: Can be revoked

### 3. **Middleware Protection**
- **JWT Verification**: `auth` middleware checks all protected routes
- **Token Validation**: Verifies signature and expiration
- **User Context**: Attaches decoded user data to `req.user`
- **Role-Based Access**: `restrictTo()` middleware for authorization

### 4. **Database Security**
- **Connection**: Secured with environment variables
- **SQL Injection**: Protected via parameterized queries
- **Token Revocation**: Logout invalidates refresh tokens
- **Audit Trail**: Tracks `last_login` timestamps

---

## 📝 Implementation Details

### Registration Endpoint
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Set-Cookie: refreshToken={token}; HttpOnly; Secure; SameSite=Strict
```

### Login Endpoint
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: Same as registration
```

### Protected Route Example
```javascript
GET /api/users/profile
Authorization: Bearer {accessToken}

Response:
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Refresh Token Endpoint
```javascript
POST /api/auth/refresh
Cookie: refreshToken={token}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout Endpoint
```javascript
POST /api/auth/logout
Cookie: refreshToken={token}

Response:
{
  "message": "Logged out successfully"
}
Set-Cookie: refreshToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

## 🛡️ Security Best Practices Implemented

1. ✅ **Password Hashing**: bcrypt with 12 rounds (2^12 iterations)
2. ✅ **JWT Secret Keys**: Stored in environment variables
3. ✅ **httpOnly Cookies**: Refresh tokens protected from XSS
4. ✅ **Token Expiration**: Short-lived access tokens (15 min)
5. ✅ **Token Rotation**: New refresh token on each login
6. ✅ **Token Revocation**: Logout invalidates refresh tokens
7. ✅ **SQL Parameterization**: Protection against SQL injection
8. ✅ **Input Validation**: Zod schema validation on all inputs
9. ✅ **Error Handling**: Generic messages prevent information leakage
10. ✅ **CORS Configuration**: Restricted to frontend origin

---

## 🔄 Token Lifecycle

### Access Token
```
Generate → Store in localStorage → Add to API requests → Expires (15min) → 
Auto-refresh → New token → Continue
```

### Refresh Token
```
Generate → Store in httpOnly cookie → Verify on refresh → 
Valid for 7 days → Revoked on logout → Deleted from DB
```

---

## 📊 Database Schema

### users table
```sql
- id (SERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE NOT NULL)
- password_hash (VARCHAR NOT NULL)  -- bcrypt hashed
- first_name (VARCHAR NOT NULL)
- last_name (VARCHAR NOT NULL)
- role (VARCHAR DEFAULT 'student')
- is_active (BOOLEAN DEFAULT true)
- last_login (TIMESTAMP)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

### refresh_tokens table
```sql
- id (SERIAL PRIMARY KEY)
- token (VARCHAR UNIQUE NOT NULL)  -- JWT refresh token
- user_id (INTEGER FK → users.id)
- expires_at (TIMESTAMP NOT NULL)
- is_revoked (BOOLEAN DEFAULT false)
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
```

---

## 🧪 Testing

Run the authentication integration tests:
```bash
# Start database
docker-compose up database

# Run tests
cd backend
npm test tests/integration/auth.test.js
```

Tests cover:
- ✅ User registration with password hashing
- ✅ Login with password verification
- ✅ JWT token generation
- ✅ Token refresh flow
- ✅ Logout and token revocation
- ✅ Protected route access
- ✅ Invalid credentials handling
- ✅ Expired token handling

---

## 🚀 Quick Start

1. **Configure environment**:
   ```bash
   cp backend/.env.example backend/.env
   # Update JWT_SECRET and JWT_REFRESH_SECRET
   ```

2. **Start services**:
   ```bash
   docker-compose up
   ```

3. **Access application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

4. **Create account**:
   - Navigate to signup page
   - Fill registration form
   - System hashes password with bcrypt
   - Redirects to dashboard with JWT

---

## 📚 References

- **bcrypt**: https://www.npmjs.com/package/bcryptjs
- **JWT**: https://jwt.io/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **OWASP Auth**: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
