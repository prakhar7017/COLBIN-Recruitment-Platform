# Recruitment Platform API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. For protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User

Creates a new user account and returns a JWT token.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth required**: No
- **Content-Type**: `application/json`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response:**

- **Code**: 201 Created
- **Content**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **Code**: 400 Bad Request
- **Content**:

```json
{
  "success": false,
  "error": "User already exists"
}
```

OR

```json
{
  "errors": [
    {
      "msg": "Please include a valid email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

- **Code**: 500 Server Error
- **Content**:

```json
{
  "success": false,
  "error": "Server error"
}
```

#### Login User

Authenticates a user and returns a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth required**: No
- **Content-Type**: `application/json`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response:**

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

- **Code**: 500 Server Error
- **Content**:

```json
{
  "success": false,
  "error": "Server error"
}
```

#### Get Current User

Returns the currently authenticated user's data.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth required**: Yes
- **Headers**: `Authorization: Bearer <token>`

**Success Response:**

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "skills": ["JavaScript", "React"],
    "experience": 3,
    "education": "Bachelor's in Computer Science",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

- **Code**: 500 Server Error
- **Content**:

```json
{
  "success": false,
  "error": "Server error"
}
```

### User Profile

#### Get User Profile

Returns the user's profile data.

- **URL**: `/users/profile`
- **Method**: `GET`
- **Auth required**: Yes
- **Headers**: `Authorization: Bearer <token>`

**Success Response:**

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "skills": ["JavaScript", "React"],
    "experience": 3,
    "education": "Bachelor's in Computer Science",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

- **Code**: 404 Not Found
- **Content**:

```json
{
  "success": false,
  "error": "User not found"
}
```

- **Code**: 500 Server Error
- **Content**:

```json
{
  "success": false,
  "error": "Server error"
}
```

#### Update User Profile

Updates the user's profile data.

- **URL**: `/users/profile`
- **Method**: `PUT`
- **Auth required**: Yes
- **Headers**: `Authorization: Bearer <token>`
- **Content-Type**: `application/json`

**Request Body:**

```json
{
  "name": "John Doe",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": 4,
  "education": "Master's in Computer Science"
}
```

**Success Response:**

- **Code**: 200 OK
- **Content**:

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": 4,
    "education": "Master's in Computer Science",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **Code**: 401 Unauthorized
- **Content**:

```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

- **Code**: 404 Not Found
- **Content**:

```json
{
  "success": false,
  "error": "User not found"
}
```

- **Code**: 400 Bad Request
- **Content**:

```json
{
  "errors": [
    {
      "msg": "Experience must be a number",
      "param": "experience",
      "location": "body"
    }
  ]
}
```

- **Code**: 500 Server Error
- **Content**:

```json
{
  "success": false,
  "error": "Server error"
}
```

## Data Models

### User Model

```typescript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
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
}
```

## Error Codes and Descriptions

| Status Code | Description | Example Scenario |
|-------------|-------------|-----------------|
| 200 | OK | Successful GET, PUT request |
| 201 | Created | Successful POST request that creates a resource |
| 400 | Bad Request | Invalid input data, validation errors |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected server error |

## Rate Limiting

Currently, the API does not implement rate limiting. For production use, consider implementing rate limiting to prevent abuse.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api`.

## CORS Configuration

The API is configured to accept requests from the frontend application running on `http://localhost:5173` in development mode.

## Authentication Flow

1. User registers or logs in
2. Server validates credentials and returns JWT token
3. Client stores token in localStorage
4. Client includes token in Authorization header for subsequent requests
5. Server validates token for protected routes
6. If token is invalid or expired, server returns 401 Unauthorized

## Security Considerations

1. Passwords are hashed using bcrypt before storage
2. JWT tokens are signed with a secure secret key
3. Sensitive data like passwords are not returned in responses
4. Input validation is performed on all endpoints
5. CORS is configured to prevent unauthorized access
