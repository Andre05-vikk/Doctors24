# Doctors24

Doctors24 is a web application that allows users to view a list of doctors and initiate video calls for consultation, managing their sessions seamlessly.

## Features

### Authentication System
- Secure signup with email verification
- Sign in with rate limiting
- Password reset functionality
- Protected routes for authenticated users
- CSRF protection

### User Management
- Two types of users: Doctors and Patients
- Comprehensive registration form including:
  - Username and full name
  - Email verification
  - Password with security requirements
  - Personal details (gender, age 18+, languages)
  - Location information
  - Rate per minute (for doctors)
- User profile management
- Session handling

### Security Features
- Password encryption (bcrypt)
- CSRF protection
- Rate limiting
- Secure session management
- Input validation and sanitization

## Technical Stack

### Frontend
- Bootstrap 5 for responsive design
- Handlebars templating engine
- Vanilla JavaScript
- Form validation

### Backend
- Node.js with Express
- Prisma ORM
- SQLite database
- Email service integration

## Project Setup

1. Install dependencies:
```sh
npm install
```

2. Configure environment variables:
```sh
cp .env.example .env
```
Update .env with your settings:
```
DATABASE_URL="file:./dev.db"
SMTP_HOST=your-smtp-host
SMTP_PORT=your-smtp-port
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
APP_URL=http://localhost:3000
```

3. Initialize database:
```sh
# Create and apply migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed the database with initial data (optional)
npx prisma db seed
```

4. Start the server:
```sh
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.js         # Database seeding
├── public/
│   ├── js/             # Client-side JavaScript
│   └── css/            # Stylesheets
├── routes/
│   └── auth.js         # Authentication routes
├── services/
│   └── emailService.js # Email functionality
├── views/
│   ├── layouts/        # Main layout
│   └── partials/       # Reusable components
└── server.js           # Application entry point
```

## Database Schema

```prisma
model User {
  id              Int       @id @default(autoincrement())
  username        String    @unique
  email           String    @unique
  name            String
  password        String
  gender          String
  age             Int
  spokenLanguages String
  location        String
  ratePerMinute   Float
  role            String    @default("USER")
  isActive        Boolean   @default(true)
  emailVerified   Boolean   @default(false)
  verificationToken String?
  tokenExpiry     DateTime?
  resetToken      String?
  resetTokenExpiry DateTime?
}
```

## Authentication Routes

### Authentication
- POST /auth/signup - Register new user
- POST /auth/signin - User login
- GET /auth/verify/:token - Email verification
- POST /auth/forgot-password - Request password reset
- POST /auth/reset-password/:token - Reset password

## Security Measures

- Passwords hashed using bcrypt (12 rounds)
- CSRF tokens on all forms
- Rate limiting on authentication endpoints
- Input validation (client & server side)
- Secure session cookies
- Email verification required

## Development Guidelines

- Follow ESLint configuration
- Use async/await for asynchronous operations
- Validate all user inputs
- Handle errors appropriately
- Keep security best practices in mind

## Testing

Run tests using:
```sh
npm test
```

## Demo Account

For testing purposes, you can use the following credentials:
```
Email: test
Password: test
```