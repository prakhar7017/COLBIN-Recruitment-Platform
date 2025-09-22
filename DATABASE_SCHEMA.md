# Recruitment Platform Database Schema

## Overview

The Recruitment Platform uses MongoDB as its database, with Mongoose as the ODM (Object Document Mapper). This document outlines the database schema design, relationships, and indexing strategies.

## User Collection

The User collection stores information about all users in the system, including job seekers and recruiters.

### Schema

```typescript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: Number,
    default: 0
  },
  education: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Indexes

```typescript
// Email index for fast lookups and ensuring uniqueness
UserSchema.index({ email: 1 }, { unique: true });

// Index on role for filtering users by role
UserSchema.index({ role: 1 });

// Compound index for searching users by skills
UserSchema.index({ skills: 1, experience: -1 });
```

### Methods

```typescript
// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and return JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};
```

### Middleware

```typescript
// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

## Future Collections

The following collections are planned for future expansion of the platform:

### Job Collection

```typescript
const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  company: {
    type: String,
    required: [true, 'Please add a company']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  salary: {
    type: String
  },
  requirements: {
    type: [String],
    default: []
  },
  recruiter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Application Collection

```typescript
const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interviewed', 'rejected', 'accepted'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Company Collection

```typescript
const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  description: {
    type: String
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  location: {
    type: String
  },
  industry: {
    type: String
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  recruiters: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

## Relationships

The database schema is designed with the following relationships:

1. **User to Job (One-to-Many)**:
   - A recruiter can post multiple jobs
   - Each job is associated with one recruiter

2. **User to Application (One-to-Many)**:
   - A user can submit multiple job applications
   - Each application is associated with one user

3. **Job to Application (One-to-Many)**:
   - A job can receive multiple applications
   - Each application is for one specific job

4. **Company to User (One-to-Many)**:
   - A company can have multiple recruiters
   - Each recruiter is associated with one company

5. **Company to Job (One-to-Many)**:
   - A company can have multiple job postings
   - Each job is associated with one company

## Indexing Strategy

The database uses the following indexing strategy to optimize query performance:

1. **Single-Field Indexes**:
   - User.email: For fast user lookups and ensuring uniqueness
   - User.role: For filtering users by role
   - Job.status: For filtering active/inactive jobs
   - Job.recruiter: For finding jobs posted by a specific recruiter
   - Application.status: For filtering applications by status

2. **Compound Indexes**:
   - User.skills + User.experience: For searching candidates with specific skills and experience
   - Job.location + Job.title: For searching jobs by location and title
   - Application.job + Application.status: For finding applications for a specific job with a specific status

3. **Text Indexes**:
   - Job.title + Job.description: For full-text search across job listings
   - User.skills: For searching users by skills

## Data Validation

Data validation is implemented at multiple levels:

1. **Schema-Level Validation**:
   - Required fields
   - Field type checking
   - Enum values for restricted choices
   - Min/max length constraints
   - Regular expression patterns

2. **Application-Level Validation**:
   - Input sanitization
   - Business logic validation
   - Cross-field validation

3. **API-Level Validation**:
   - Request body validation using express-validator
   - Parameter validation

## Data Migration Strategy

For future schema changes, the following migration strategy will be used:

1. **Backward Compatibility**:
   - Add new fields with default values
   - Keep supporting old field names during transition
   - Use schema versioning

2. **Migration Scripts**:
   - Create scripts for one-time data migrations
   - Run migrations during off-peak hours
   - Include rollback capability

3. **Testing**:
   - Test migrations on staging environment
   - Verify data integrity after migration
   - Performance testing with migrated data

## Backup and Recovery

The database backup strategy includes:

1. **Regular Backups**:
   - Daily full backups
   - Hourly incremental backups
   - Offsite backup storage

2. **Point-in-Time Recovery**:
   - Transaction logs for continuous backup
   - Ability to restore to any point in time

3. **Disaster Recovery**:
   - Geographically distributed replicas
   - Automated failover procedures
   - Regular recovery testing
