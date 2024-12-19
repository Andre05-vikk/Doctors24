const express = require('express');
const {PrismaClient} = require('@prisma/client');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Helper function to generate a session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Middleware to handle sessions manuallyapp.use(async (req, res, next) => {
app.use(async (req, res, next) => {
    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
        sessionId = generateSessionId();
        res.cookie('sessionId', sessionId, {maxAge: 1000 * 60 * 30, httpOnly: true}); // 30 minutes
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

    res.locals.user = req.session.data.userId ? await prisma.user.findUnique({where: {id: req.session.data.userId}}) : null;

    next();
});


// Set up handlebars
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {title: 'Public Page'});
});

app.get('/protected', (req, res) => {
    if (!res.locals.user) {
        return res.render('protected', {title: 'Protected Page (Please Sign In)'});
    } else {
        return res.render('protected', {title: 'Protected Page'});
    }
});

// Auth endpoints
app.post('/api/sessions', async (req, res) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({where: {email}});
    if (user && user.password === password) {
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

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));