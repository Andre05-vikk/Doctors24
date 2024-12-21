# Doctors24

Doctors24 is a web application that allows users to view a list of doctors and initiate video calls for consultation, managing their sessions seamlessly.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [Security](#security)

## Features
### Authentication & User Management
- User registration with validation:
  - Personal info (Name, Email, Gender, Age)
  - Professional info (Languages, Location, Rate/minute)
  - Role-based access (User/Doctor/Admin)
- Session-based authentication
- Password reset functionality
- Email verification
- Protected routes:
  - Access control for authenticated users
  - Automatic redirect for unauthorized access
  - Session validation

### Security Features
- CSRF protection
- Rate limiting
- Input validation & sanitization
- Secure session management

## Tech Stack
### Backend
- Node.js with Express
- Prisma ORM
- SQLite database
- Handlebars templating
- Email service integration

### Frontend
- Bootstrap 5
- Vanilla JavaScript
- Form validation

## Project Structure
```
.
├── lib/
│   └── prisma.js          # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.js            # Database seeding
│   └── migrations/        # Database migrations
├── public/
│   └── js/
│       ├── signup.js      # Client-side validation
│       └── passwordReset.js
├── routes/
│   └── auth.js           # Authentication routes
├── services/
│   └── emailService.js   # Email functionality
├── views/
│   ├── layouts/
│   │   └── main.handlebars      # Base layout template
│   ├── partials/
│   │   ├── signinForm.handlebars       # Login form
│   │   ├── signupForm.handlebars       # Registration form
│   │   ├── resetPasswordForm.handlebars # Password reset
│   │   └── forgotPasswordForm.handlebars # Forgot password
│   ├── protected.handlebars     # Protected page for authenticated users
│   └── auth/
│       ├── success.handlebars    # Success messages
│       └── error.handlebars      # Error handling
├── app.js                # Main application file
└── package.json
```

## Setup & Installation
1. **Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Required variables:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   SESSION_SECRET="your-secret"
   SMTP_HOST=your-smtp-host
   SMTP_PORT=your-smtp-port
   SMTP_USER=your-smtp-user
   SMTP_PASS=your-smtp-password
   APP_URL=http://localhost:3000
   ```

3. **Database Initialization**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start Application**
   ```bash
   npm run start
   ```
   Server runs at: http://localhost:3000

## Development
### Available Scripts
- `npm run start` - Start development server
- `npx prisma studio` - Database management UI
- `npx prisma migrate reset` - Reset database
- `DEBUG=* npm run start` - Run with debug output

### Test Accounts
- Doctor:
  - Email: test@test.com
  - Password: Test123!@#
- User:
  - Email: doctor2@example.com
  - Password: Test123!@#
- Admin:
  - Email: admin@example.com
  - Password: Admin123!@#

## Security
- SQLite with Prisma ORM
- Bcrypt password hashing (12 rounds)
- CSRF protection
- Input sanitization
- Rate limiting
- Session management

### Email Configuration
The application uses Nodemailer for sending emails:
- Registration confirmation
- Password reset links
- Email verification

For development, you can use:
- [Ethereal Email](https://ethereal.email/) for testing
- Real SMTP server for production