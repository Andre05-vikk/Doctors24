const nodemailer = require('nodemailer');

// Create a test account or use your SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Check email configuration
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email service configuration missing. Using test account.');
}

const sendVerificationEmail = async (email, token) => {
    try {
        // Log email attempt (ilma tokenita)
        console.log(`Sending verification email to: ${email.split('@')[0]}***`);
        
        const verificationUrl = `${process.env.APP_URL}/auth/verify/${token}`;
        
        const mailOptions = {
            from: '"Doctors24" <noreply@doctors24.com>',
            to: email,
            subject: 'Verify your email address',
            html: `
                <h1>Welcome to Doctors24!</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
                <p>This link will expire in 24 hours.</p>
            `
        };

        return await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password/${token}`;
    
    const mailOptions = {
        from: '"Doctors24" <noreply@doctors24.com>',
        to: email,
        subject: 'Reset your password',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}; 