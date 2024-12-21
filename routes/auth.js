const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const prisma = new PrismaClient();

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Generate verification token
const generateToken = () => crypto.randomBytes(32).toString('hex');

// Add CSRF token to signup form
router.get('/signup', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Add input validation middleware
const validateSignupInput = (req, res, next) => {
    const { 
        username,
        email, 
        password, 
        name, 
        gender, 
        age, 
        spokenLanguages, 
        location, 
        ratePerMinute,
        role 
    } = req.body;

    const errors = [];

    // Username validation
    if (!username || username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }

    // Age validation
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
        errors.push('Age must be between 18 and 99');
    }

    // Role validation
    const validRoles = ['USER', 'DOCTOR'];
    if (!validRoles.includes(role)) {
        errors.push('Invalid role selection');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        errors.push('Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters');
    }

    // Name validation
    if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Gender validation
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender.toLowerCase())) {
        errors.push('Invalid gender selection');
    }

    // Languages validation
    if (!spokenLanguages || spokenLanguages.trim() === '') {
        errors.push('At least one language must be specified');
    }

    // Location validation
    if (!location || location.trim() === '') {
        errors.push('Location is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors 
        });
    }

    next();
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 signup requests per hour
    message: 'Too many signup attempts, please try again later'
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 requests per 15 minutes
    message: 'Too many password reset attempts, please try again later'
});

const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 reset attempts per hour
    message: 'Too many password reset attempts, please try again later'
});

// Apply rate limiting and CSRF protection to signup route
router.post('/signup', signupLimiter, csrfProtection, validateSignupInput, async (req, res) => {
    try {
        const {
            email,
            password,
            name,
            gender,
            age,
            spokenLanguages,
            location,
            ratePerMinute
        } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Generate verification token
        const verificationToken = generateToken();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Hash password with stronger salt rounds
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                gender: gender.toLowerCase(),
                age: parseInt(age),
                spokenLanguages,
                location,
                ratePerMinute: parseFloat(ratePerMinute),
                verificationToken,
                tokenExpiry,
                emailVerified: false
            }
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Don't send back the full user object for security
        res.status(201).json({ 
            message: 'Registration successful. Please check your email to verify your account.',
            userId: user.id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Email verification route
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                tokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.render('auth/error', {
                message: 'Invalid or expired verification token. Please request a new verification email.',
                showRetry: false
            });
        }

        // Update user verification status
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null,
                tokenExpiry: null
            }
        });

        res.render('auth/success', {
            message: 'Your email has been successfully verified. You can now sign in.',
            showLogin: true
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.render('auth/error', {
            message: 'Verification failed. Please try again later.',
            showRetry: false
        });
    }
});

// Request password reset
router.post('/forgot-password', forgotPasswordLimiter, csrfProtection, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // Return success even if user doesn't exist (security)
            return res.json({ message: 'If an account exists, a password reset email has been sent.' });
        }

        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'If an account exists, a password reset email has been sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Failed to process password reset request' });
    }
});

// Reset password with token
router.post('/reset-password/:token', resetPasswordLimiter, csrfProtection, async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.render('auth/success', {
            message: 'Your password has been successfully reset.',
            showLogin: true
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.render('auth/error', {
            message: 'Failed to reset password. Please try again.',
            showRetry: true,
            retryLink: `/auth/reset-password/${req.params.token}`
        });
    }
});

// Reset password page
router.get('/reset-password/:token', csrfProtection, async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.render('auth/error', {
                message: 'Invalid or expired reset token',
                showRetry: false
            });
        }

        res.render('resetPassword', {
            csrfToken: req.csrfToken(),
            token
        });
    } catch (error) {
        console.error('Reset password page error:', error);
        res.render('auth/error', {
            message: 'Error loading reset password page',
            showRetry: false
        });
    }
});

module.exports = router; 