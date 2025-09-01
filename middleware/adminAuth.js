const { verifyToken } = require('./authenticate');

// Middleware pour vérifier l'authentification admin pour les vues web
const requireAdminAuth = async (req, res, next) => {
    // Chercher le token dans les cookies ou headers
    const authToken = req.headers.authorization || req.cookies?.adminToken;
    
    console.log('AdminAuth - Token trouvé:', authToken ? 'OUI' : 'NON');
    console.log('AdminAuth - Cookies disponibles:', Object.keys(req.cookies || {}));

    try {
        const user = await verifyToken(authToken);
        if (!user) {
            // Rediriger vers la page de login si pas authentifié
            return res.redirect('/admin/login');
        }
        
        // Vérifier si l'utilisateur a les permissions admin
        if (user.roleId !== 'ADMIN') { // roleId 'ADMIN' = admin
            return res.redirect('/admin/login?error=Permissions insuffisantes');
        }
        
        req.user = user;
        res.locals.user = user; // Rendre l'utilisateur disponible dans les vues
        next();
    } catch (error) {
        console.error('Erreur d\'authentification admin:', error);
        return res.redirect('/admin/login?error=Erreur d\'authentification');
    }
};

// Middleware pour les pages de login (rediriger si déjà connecté)
const redirectIfAuthenticated = async (req, res, next) => {
    const authToken = req.headers.authorization || req.cookies?.adminToken;

    try {
        const user = await verifyToken(authToken);
        if (user && user.roleId === 'ADMIN') {
            // Si déjà connecté en tant qu'admin, rediriger vers le dashboard
            return res.redirect('/admin');
        }
        next();
    } catch (error) {
        // En cas d'erreur, continuer vers la page de login
        next();
    }
};

module.exports = { requireAdminAuth, redirectIfAuthenticated };
