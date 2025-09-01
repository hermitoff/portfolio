const { User, Session } = require('../models/index');

// Function to verify the token and return the user if valid
const verifyToken = async (authToken) => {
    
    if (!authToken) {
        return null;
    }

    const session = await Session.findOne({ where: { token: authToken } });
    
    if (session) {
        console.log('verifyToken - Détails session:', {
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
            createdAt: session.createdAt
        });
    }

    if (!session) {
        return null;
    }

    const now = new Date();

    // Vérifier si la date d'expiration est valide
    if (!session.expiresAt || isNaN(new Date(session.expiresAt).getTime())) {
        console.log('verifyToken - Date d\'expiration invalide');
        return null;
    }

    if (session.expiresAt < now) {
        return null;
    }

    const user = await User.findByPk(session.userId);    
    if (!user) {
        return null;
    }

    return user;
};

// Middleware : Authenticate the user using the token from the request headers
const authenticate = async (req, res, next) => {
    const authToken = req.headers.authorization;

    try {
        const user = await verifyToken(authToken);
        if (!user) {
            return res.status(401).json({ error: `Unauthorized` });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: `Unauthorized` });
    }
};

// Middleware : Check if the user is authenticated, and return the user object, or false
const checkAuthentication = async (req, res, next) => {
    const authToken = req.headers.authorization;

    try {
        const user = await verifyToken(authToken);
        req.isAuthenticated = !!user;
        req.user = user;
    } catch (error) {
        req.isAuthenticated = false;
    }
    next();
};

module.exports = { authenticate, checkAuthentication, verifyToken };