# TicketHub - Event Management Platform

A comprehensive event management and online ticketing platform built with the MERN stack.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

TicketHub is a full-stack web application designed to streamline event management and ticket sales. The platform serves three primary user roles:

- **Administrators**: Full system control, user management, and analytics
- **Organizers**: Create and manage events, sell tickets, track revenue
- **Attendees**: Browse events, purchase tickets, manage bookings

The application provides a modern, responsive interface with real-time updates and comprehensive analytics.

---

## Key Features

### Event Management
- Create, edit, and delete events with rich media support
- Multiple ticket types with individual pricing and availability
- Automatic event status tracking (upcoming, ongoing, expired)
- Advanced search and filtering capabilities
- Category-based organization

### Ticketing System
- Secure online ticket purchasing
- Multiple payment gateway integration (Momo, VNPay, QR Code)
- Automatic QR code generation for each ticket
- Email delivery of tickets with QR codes
- Real-time ticket availability tracking

### Check-in System
- QR code scanner for event check-in
- Manual ticket code verification
- Real-time check-in statistics
- Check-in history and analytics

### User Management
- Role-based access control (Admin, Organizer, User)
- JWT-based authentication
- Password reset via email
- User profile management
- Booking history

### Analytics Dashboard
- Revenue tracking and visualization
- Ticket sales statistics
- Event performance metrics
- User engagement analytics
- Exportable reports

### Email Notifications
- Automated ticket delivery
- Booking confirmations
- Password reset emails
- Event reminders
- Professional email templates

---

## Technology Stack

### Frontend
- React 18.2.0 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Vite as build tool
- React Router v6 for navigation
- Axios for API communication
- Recharts for data visualization
- React Hook Form for form handling

### Backend
- Node.js 18+ with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Nodemailer for email services
- Cloudinary for image storage
- Bcrypt for password hashing
- Express Validator for input validation

### Development Tools
- ESLint and Prettier for code quality
- Git for version control
- Postman for API testing

---

## Prerequisites

Before installation, ensure you have the following installed:

- Node.js (version 18.0.0 or higher)
- MongoDB (version 5.0 or higher)
- npm or yarn package manager
- Git

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tickethub.git
cd tickethub
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

---


#### Start Backend Server

```bash
cd server
npm run dev
```

The backend server will start at `http://localhost:3001`

#### Start Frontend Development Server

```bash
cd client
npm run dev
```

The frontend will start at `http://localhost:3000`

### Production Mode

#### Build Frontend

```bash
cd client
npm run build
```

#### Start Backend in Production

```bash
cd server
npm start
```



## Project Structure

```
tickethub/
│
├── client/                     # Frontend application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── charts/        # Chart components
│   │   │   ├── forms/         # Form components
│   │   │   ├── layouts/       # Layout components
│   │   │   ├── organizer/     # Organizer-specific components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux store configuration
│   │   │   └── slices/        # Redux slices
│   │   ├── styles/            # Global styles
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Application entry point
│   |
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend application
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── checkinController.js
│   │   │   ├── eventController.js
│   │   │   ├── organizerController.js
│   │   │   ├── paymentController.js
│   │   │   └── ticketController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── upload.js
│   │   ├── models/            # Database models
│   │   │   ├── Event.js
│   │   │   ├── Ticket.js
│   │   │   └── User.js
│   │   ├── routes/            # API routes
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── checkinRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── organizerRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   └── ticketRoutes.js
│   │   ├── services/          # Business logic
│   │   │   ├── emailService.js
│   │   │   └── paymentService.js
│   │   ├── utils/             # Helper functions
│   │   └── index.js           # Server entry point
│   |
│   ├── package.json
│   
│
|
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Documentation

### Base URL

```
http://localhost:3001/api
```


---

## Continuous Integration

This project uses GitHub Actions for CI/CD. The following workflows are configured:

### CI Workflow (`ci.yml`)
Runs on every push and pull request to `main` and `develop` branches:
- Lints code (ESLint)
- Runs tests
- Builds application
- Checks for security vulnerabilities

### PR Check Workflow (`pr-check.yml`)
Runs on pull requests:
- Validates PR title format
- Checks for large files
- Runs tests with coverage
- Comments results on PR

### Deploy Workflow (`deploy.yml`)
Runs on push to `main` branch:
- Deploys frontend to Vercel
- Deploys backend to Render/Railway
- Performs health checks

### CodeQL Workflow (`codeql.yml`)
Runs weekly and on security-related changes:
- Scans code for security vulnerabilities
- Analyzes code quality

### Required Secrets

Configure these secrets in your GitHub repository settings:

**Frontend Deployment:**
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VITE_API_URL` - Production API URL

**Backend Deployment:**
- `RENDER_SERVICE_ID` - Render service ID
- `RENDER_API_KEY` - Render API key
- Or for Railway:
  - `RAILWAY_TOKEN` - Railway authentication token
  - `RAILWAY_SERVICE` - Railway service name

**Health Checks:**
- `FRONTEND_URL` - Production frontend URL
- `BACKEND_URL` - Production backend URL

---

## Deployment

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy

### Backend Deployment (Render/Railway)

1. Push code to GitHub
2. Connect repository to hosting service
3. Configure environment variables
4. Set build command: `npm install`
5. Set start command: `npm start`

### Database Deployment (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in environment variables

---


### Code Style

- Follow ESLint and Prettier configurations
- Write clear, self-documenting code
- Add comments for complex logic
- Write unit tests for new features

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

## Acknowledgments

This project was built using the following open-source technologies:
- React
- Node.js
- Express.js
- MongoDB
- Tailwind CSS
- And many other excellent libraries

---

Last updated: December 2025
