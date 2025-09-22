# Recruitment Platform Prototype

A full-stack recruitment platform with user authentication, profile management, and secure API endpoints.

## Features

- User registration and authentication using JWT
- User profile management
- Secure API endpoints
- React frontend with TypeScript
- MongoDB database
- Express backend with TypeScript

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

### Frontend
- React with TypeScript
- React Router for navigation
- Axios for API requests
- TailwindCSS for styling

## Project Structure

```
recruitment-platform/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Entry point
│   ├── .env              # Environment variables
│   ├── package.json      # Dependencies
│   └── tsconfig.json     # TypeScript configuration
│
└── frontend/             # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── context/      # Context API
    │   ├── types/        # TypeScript types
    │   ├── App.tsx       # Main component
    │   └── main.tsx      # Entry point
    ├── index.html        # HTML template
    ├── package.json      # Dependencies
    └── vite.config.ts    # Vite configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```
   
   Note: For MongoDB, you can use either a local MongoDB instance or MongoDB Atlas (cloud-hosted). The example above shows the connection string format for MongoDB Atlas.

4. Build and start the server:
   ```
   npm run build
   npm start
   ```

   For development with hot reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
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

### User Profile Endpoints

#### Get User Profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
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

#### Update User Profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": 4,
    "education": "Master's in Computer Science"
  }
  ```
- **Response**:
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

## Architecture and Design Decisions

### Authentication Flow
1. User registers or logs in
2. Server validates credentials
3. Server generates JWT token
4. Client stores token in localStorage
5. Client includes token in Authorization header for protected routes
6. Server validates token for protected routes

### Security Measures
- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Input validation using express-validator
- Protected routes using middleware
- CORS enabled for API security

### Error Handling
- Consistent error response format
- Validation errors returned to client
- Try/catch blocks for async operations
- Proper HTTP status codes

## Scaling Suggestions

### Backend Scaling
1. **Database Optimization**:
   - Implement database indexing for frequently queried fields
   - Consider sharding for horizontal scaling
   - Use connection pooling

2. **API Performance**:
   - Implement caching with Redis for frequently accessed data
   - Use pagination for large data sets
   - Consider GraphQL for more efficient data fetching

3. **Infrastructure**:
   - Deploy using containerization (Docker)
   - Use load balancing for horizontal scaling
   - Implement CI/CD pipelines

### Frontend Scaling
1. **Performance Optimization**:
   - Implement code splitting
   - Use lazy loading for components
   - Optimize bundle size

2. **State Management**:
   - Consider Redux for complex state management
   - Implement server-side rendering

3. **User Experience**:
   - Add real-time notifications
   - Implement advanced search functionality
   - Add analytics for user behavior tracking

## Future Enhancements
1. Email verification for new users
2. Password reset functionality
3. Role-based access control
4. Job posting and application features
5. Messaging system between recruiters and applicants
6. Resume upload and parsing
7. Advanced search and filtering
8. Analytics dashboard for recruiters
# COLBIN-Recruitment-Platform
