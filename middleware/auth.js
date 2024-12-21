const crypto = require('crypto');

function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

function createAuthMiddleware(prisma) {
    return async (req, res, next) => {
        let sessionId = req.cookies.sessionId;

        if (!sessionId) {
            sessionId = generateSessionId();
            res.cookie('sessionId', sessionId, {
                maxAge: 1000 * 60 * 30, // 30 minutes
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
        }

        // Clean up expired sessions
        await prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        req.session = await prisma.session.findUnique({
            where: { sid: sessionId }
        });

        if (!req.session) {
            req.session = { sid: sessionId, data: {} };
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

        if (req.session.data.userId) {
            res.locals.user = await prisma.user.findUnique({
                where: { id: req.session.data.userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    role: true,
                    gender: true,
                    age: true,
                    spokenLanguages: true,
                    location: true,
                    ratePerMinute: true,
                    isActive: true,
                    emailVerified: true
                }
            });
        } else {
            res.locals.user = null;
        }

        next();
    };
}

module.exports = createAuthMiddleware; 