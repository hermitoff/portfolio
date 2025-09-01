module.exports = async function userToLocals(req, res, next) {
    const token = req.cookies.token;
    if (token) {
        const { verifyToken } = require('./authenticate');
        const user = await verifyToken(token);
        res.locals.user = user ? user.toJSON() : null;
        req.user = user ? user.toJSON() : null;
    } else {
        res.locals.user = null;
        req.user = null;
    }
    next();
};