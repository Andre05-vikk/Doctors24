const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const csrf = require('csurf');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const prisma = require('../lib/prisma');
const validator = require('validator');
const sanitize = require('sanitize-html');

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
    try {
        const { 
            username,
            email, 
            password, 
            confirmPassword,
            name, 
            gender, 
            age, 
            spokenLanguages, 
            location, 
            ratePerMinute,
            role 
        } = req.body;

        const errors = [];
        const sanitizedData = {};

        // Username validation
        if (!username || username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else {
            sanitizedData.username = sanitize(username.trim());
            if (!/^[a-zA-Z0-9_-]+$/.test(sanitizedData.username)) {
                errors.push('Username can only contain letters, numbers, underscores and hyphens');
            }
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Invalid email format');
        } else {
            sanitizedData.email = validator.normalizeEmail(email.toLowerCase());
        }

        // Age validation
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
            errors.push('Age must be between 18 and 99');
        } else {
            sanitizedData.age = parseInt(age, 10);
        }

        // Role validation
        const validRoles = ['USER', 'DOCTOR'];
        if (!role || !validRoles.includes(role.toUpperCase())) {
            errors.push('Invalid role selection');
        } else {
            sanitizedData.role = role.toUpperCase();
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            errors.push('Password must contain at least 8 characters...');
        } else if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        } else {
            sanitizedData.password = password;
        }

        // Name validation
        if (!name || name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else {
            sanitizedData.name = sanitize(name.trim());
            if (!/^[a-zA-Z\s-]+$/.test(sanitizedData.name)) {
                errors.push('Name can only contain letters, spaces and hyphens');
            }
        }

        // Gender validation
        const validGenders = ['male', 'female', 'other'];
        if (!gender || !validGenders.includes(gender.toLowerCase())) {
            errors.push('Invalid gender selection');
        } else {
            sanitizedData.gender = gender.toLowerCase();
        }

        // Languages validation
        if (!spokenLanguages || spokenLanguages.trim() === '') {
            errors.push('At least one language must be specified');
        } else {
            let languagesArray = Array.isArray(spokenLanguages) 
                ? spokenLanguages 
                : spokenLanguages.split(',');
            
            sanitizedData.spokenLanguages = languagesArray
                .map(lang => sanitize(lang.trim()))
                .filter(lang => lang.length > 0);

            if (sanitizedData.spokenLanguages.length === 0) {
                errors.push('At least one valid language must be specified');
            }
        }

        // Location validation
        if (!location || location.trim() === '') {
            errors.push('Location is required');
        } else {
            sanitizedData.location = sanitize(location.trim());
        }

        // Rate validation (required for doctors)
        if (sanitizedData.role === 'DOCTOR') {
            const rate = parseFloat(ratePerMinute);
            if (!ratePerMinute || isNaN(rate) || rate <= 0) {
                errors.push('Valid rate per minute is required for doctors');
            } else {
                sanitizedData.ratePerMinute = parseFloat(ratePerMinute);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation failed', 
                errors 
            });
        }

        // Attach sanitized data to request object
        req.sanitizedData = sanitizedData;
        next();

    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during validation'
        });
    }
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
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
        res.render('auth/error', {
            message: 'Error loading reset password page',
            showRetry: false
        });
    }
});

// CSRF token endpoint
router.post('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

module.exports = router; 

