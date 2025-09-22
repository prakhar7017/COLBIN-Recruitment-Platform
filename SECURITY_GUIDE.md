# Recruitment Platform Security Guide

## Introduction

This document outlines the security measures implemented in the Recruitment Platform and provides recommendations for enhancing security in a production environment. Security is a critical aspect of any application that handles user data and authentication.

## Current Security Implementation

### Authentication Security

#### JWT Authentication

The platform uses JSON Web Tokens (JWT) for authentication:

```javascript
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Token is returned to the client after successful authentication
res.status(200).json({
  success: true,
  token
});
```

#### Password Security

Passwords are securely hashed using bcrypt before storage:

```javascript
// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords during login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Authorization

Protected routes use middleware to verify authentication:

```javascript
// Protect routes middleware
exports.protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};
```

### Input Validation

Express-validator is used for input validation:

```javascript
// Validation rules for registration
const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

// Apply validation in route
router.post('/register', registerValidation, register);

// Check validation results in controller
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
```

## Security Vulnerabilities and Mitigations

### 1. Cross-Site Scripting (XSS)

**Vulnerability**: Attackers can inject malicious scripts into web pages viewed by users.

**Current Mitigation**:
- React's built-in XSS protection (automatic escaping)
- Input validation on the backend

**Recommended Enhancement**:
```javascript
// Add Content Security Policy headers
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
  }
}));
```

### 2. Cross-Site Request Forgery (CSRF)

**Vulnerability**: Attackers can trick users into performing unwanted actions on a site they're authenticated to.

**Current Mitigation**:
- JWT tokens stored in localStorage (not cookies)

**Recommended Enhancement**:
```javascript
// Add CSRF protection for cookie-based authentication
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Apply to routes that change state
app.post('/api/users/profile', csrfProtection, updateProfile);

// Include CSRF token in forms
app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### 3. SQL Injection / NoSQL Injection

**Vulnerability**: Attackers can inject malicious database queries.

**Current Mitigation**:
- Mongoose ORM provides some protection against NoSQL injection
- Input validation

**Recommended Enhancement**:
```javascript
// Use parameterized queries and avoid direct string interpolation
// Bad:
User.findOne({ email: req.body.email });

// Good:
User.findOne({ email: { $eq: req.body.email } });

// Sanitize inputs
const sanitize = require('mongo-sanitize');
User.findOne({ email: sanitize(req.body.email) });
```

### 4. Insecure Direct Object References (IDOR)

**Vulnerability**: Attackers can access unauthorized resources by manipulating object references.

**Current Mitigation**:
- Basic authorization checks

**Recommended Enhancement**:
```javascript
// Implement ownership verification middleware
const checkOwnership = async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  
  if (!resource) {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }
  
  // Check if user owns the resource
  if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Not authorized to access this resource' });
  }
  
  next();
};

// Apply to routes
router.put('/resources/:id', protect, checkOwnership, updateResource);
```

### 5. Sensitive Data Exposure

**Vulnerability**: Sensitive data like passwords or personal information is exposed.

**Current Mitigation**:
- Password hashing
- JWT for authentication instead of storing sessions

**Recommended Enhancement**:
```javascript
// Implement HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Add security headers
app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true }));

// Implement proper error responses that don't leak information
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't send stack traces to client
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});
```

### 6. Broken Authentication

**Vulnerability**: Authentication mechanisms are implemented incorrectly.

**Current Mitigation**:
- JWT with expiration
- Password hashing

**Recommended Enhancement**:
```javascript
// Implement rate limiting for login attempts
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes'
});

app.post('/api/auth/login', loginLimiter, login);

// Implement account lockout after failed attempts
const lockAccount = async (email) => {
  await User.findOneAndUpdate(
    { email },
    { 
      lockedUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
      loginAttempts: 0 
    }
  );
};
```

### 7. Security Misconfiguration

**Vulnerability**: Security settings are not properly configured.

**Current Mitigation**:
- Basic environment configuration

**Recommended Enhancement**:
```javascript
// Remove unnecessary headers
app.use(helmet.hidePoweredBy());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Set secure cookie flags
app.use(session({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// Implement proper CORS
const cors = require('cors');
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## Security Best Practices

### 1. Environment Variables

Store sensitive configuration in environment variables:

```javascript
// .env file (never commit to version control)
JWT_SECRET=your_secure_random_string
MONGODB_URI=mongodb://username:password@host:port/database

// Access in code
const jwtSecret = process.env.JWT_SECRET;
```

### 2. Dependency Management

Regularly update dependencies to patch security vulnerabilities:

```bash
# Check for vulnerable dependencies
npm audit

# Update dependencies
npm update

# Fix vulnerabilities
npm audit fix
```

### 3. Error Handling

Implement proper error handling that doesn't expose sensitive information:

```javascript
// Global error handler
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error(err.stack);
  
  // Send generic error to client
  res.status(500).json({
    success: false,
    error: 'Server error'
  });
});
```

### 4. Logging and Monitoring

Implement security logging and monitoring:

```javascript
// Log authentication events
const logAuthEvent = (user, event, success) => {
  const log = new SecurityLog({
    user: user._id,
    event,
    success,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  log.save();
};

// Monitor for suspicious activity
const checkSuspiciousActivity = async (userId) => {
  const recentFailedLogins = await SecurityLog.countDocuments({
    user: userId,
    event: 'login',
    success: false,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  
  if (recentFailedLogins > 10) {
    // Alert administrators
    notifyAdmins(`Suspicious activity detected for user ${userId}`);
  }
};
```

## Security Roadmap

### Phase 1: Basic Security Enhancements

1. Implement HTTPS
2. Add security headers with Helmet
3. Implement proper CORS configuration
4. Add rate limiting for authentication endpoints
5. Implement input sanitization

### Phase 2: Advanced Security Features

1. Add multi-factor authentication
2. Implement account lockout after failed login attempts
3. Add CSRF protection
4. Implement security logging and monitoring
5. Set up automated security scanning

### Phase 3: Enterprise-Level Security

1. Implement OAuth 2.0 for authentication
2. Add role-based access control
3. Implement API key management for external integrations
4. Set up intrusion detection system
5. Implement data encryption at rest

## Conclusion

Security is an ongoing process that requires continuous attention and improvement. While the current implementation provides basic security measures, implementing the recommended enhancements will significantly improve the security posture of the Recruitment Platform. Regular security audits and staying updated with the latest security best practices are essential for maintaining a secure application.
