const express = require('express');
/**
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = require('./lib/prisma');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const csrf = require('csurf');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Seadistame CSRF kaitse
app.use(csrf({ cookie: true }));

// Helper function to generate a session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Middleware to handle sessions
/**
 * @type {import('express').RequestHandler}
 */
app.use(async (req, res, next) => {
    let sessionId = req.cookies.sessionId;
    try {
        if (!sessionId) {
            sessionId = generateSessionId();
            res.cookie('sessionId', sessionId, {maxAge: 1000 * 60 * 30, httpOnly: true});
        }

        req.session = await prisma.session.findUnique({where: {sid: sessionId}});

        if (!req.session) {
            req.session = {sid: sessionId, data: {}};
            await prisma.session.create({
                data: {
                    sid: sessionId,
                    data: JSON.stringify(req.session.data),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 30)
                }
            });
        } else {
            req.session.data = JSON.parse(req.session.data);
        }

        res.locals.user = req.session.data.userId ? 
            await prisma.user.findUnique({where: {id: req.session.data.userId}}) : null;

        next();
    } catch (error) {
        await prisma.$disconnect();
        next(error);
    }
});

// Lisa veahaldus middleware
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).json({
            error: 'Invalid CSRF token',
            message: 'Form submission failed. Please refresh the page and try again.'
        });
    } else {
        next(err);
    }
});

// Lisa CSRF token igale päringule
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Lisa see rida
app.use(express.static('public'));

// Set up handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        times: function(n, block) {
            let accum = '';
            for(let i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {title: 'Public Page'});
});

app.get('/protected', (req, res) => {
    if (!res.locals.user) {
        return res.redirect('/');
    } else {
        return res.render('protected', {title: 'Protected Page'});
    }
});

// Auth endpoints
app.post('/api/sessions', async (req, res) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({where: {email}});
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.data.userId = user.id;
        await prisma.session.update({
            where: {sid: req.session.sid},
            data: {data: JSON.stringify(req.session.data)}
        });
        return res.sendStatus(200);
    }

    return res.sendStatus(401);
});

app.post('/auth/signout', async (req, res) => {
    req.session.data = {};
    await prisma.session.update({
        where: {sid: req.session.sid},
        data: {data: JSON.stringify(req.session.data)}
    });
    res.clearCookie('sessionId');
    res.redirect('/');
});

// Rate limiting for signup
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 signup requests per hour
    message: 'Too many signup attempts from this IP, please try again after an hour'
});

// Use auth routes
app.use('/auth', signupLimiter, authRoutes);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Graceful shutdown
async function shutdown() {
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
    process.exit(0);
}

// Handle process termination
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);



