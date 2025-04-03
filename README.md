# Job Portal

A full-stack job portal application built with MERN stack (MongoDB, Express, React, Node.js) with TypeScript. The platform connects job seekers and recruiters, allowing recruiters to post job listings and candidates to apply with their resume and cover letter.

## Project Structure

The project is divided into two main parts:

### Backend

- **Technology Stack**: Node.js, Express, TypeScript, MongoDB
- **Authentication**: JWT-based authentication
- **File Handling**: Uses Multer for resume and cover letter uploads
- **API Endpoints**:
  - Auth: Registration and login for users
  - Jobs: Create, list, and delete job postings
  - Applications: Apply to jobs, review applicants, and make hiring decisions

### Frontend

- **Technology Stack**: React, TypeScript, Vite, Redux Toolkit
- **UI Framework**: Tailwind CSS
- **State Management**: Redux with Redux Persist
- **Routing**: React Router v7
- **Key Features**:
  - Responsive design
  - Lazy loading components for better performance
  - Role-based access control (Candidate/Recruiter)

## Features

1. **User Authentication**
   - Register as a candidate or recruiter
   - Login with email and password

2. **For Candidates**
   - Browse job listings
   - View job details
   - Apply to jobs with resume and cover letter

3. **For Recruiters**
   - Post new job listings
   - View applicants for each job posting
   - Review candidate applications
   - Make hiring decisions

## Installation and Setup

### Prerequisites
- Node.js and npm installed
- MongoDB instance (local or cloud-based)

### Backend Setup
1. Navigate to the backend directory
   ```
   cd backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Build and run the server
   ```
   npm run build
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Jobs
- `POST /api/jobs/createjob` - Create a new job (Recruiter only)
- `GET /api/jobs/getjobs` - Get all job listings
- `DELETE /api/jobs/deletejob` - Delete a job (Recruiter only)

### Applications
- `POST /api/:job_id/apply` - Apply to a job (Candidate only)
- `GET /api/:job_id/getApplicants` - Get all applicants for a job
- `POST /api/getApplicant` - Get a specific applicant's details
- `POST /api/:applicant_id/decision` - Make a hiring decision (Recruiter only)

## Architecture

The application follows a typical MERN stack architecture with TypeScript for type safety:

- **MongoDB**: Database for storing user information, job listings, and applications
- **Express**: Backend framework for handling API requests
- **React**: Frontend library for building the user interface
- **Node.js**: Runtime environment for the backend
- **Redux**: State management for the frontend
- **TypeScript**: For type-checking and improved developer experience

## Contributors

- Vedant Phatangare

## License

ISC 