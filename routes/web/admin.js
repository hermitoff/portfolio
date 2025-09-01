const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, Session, Page } = require('../../models/index');
const { requireAdminAuth, redirectIfAuthenticated } = require('../../middleware/adminAuth');
const { generateSnowflake } = require('../../utils');
const config = require('../../config');

// Middleware pour injecter les pages visibles dans toutes les vues admin
router.use(async (req, res, next) => {
    try {
        const navPages = await Page.findAll({
            where: {
                visibleInNav: true,
                published: true
            },
            order: [['createdAt', 'ASC']]
        });
        res.locals.navPages = navPages || [];
        res.locals.currentPath = req.path;
    } catch (err) {
        res.locals.navPages = [];
        res.locals.currentPath = req.path;
    }
    next();
});

// Route pour la page de connexion admin
router.get('/login', redirectIfAuthenticated, (req, res) => {
    const error = req.query.error || null;
    const success = req.query.success || null;
    
    res.render('public-admin/login', { 
        error, 
        success
    });
});

// Route POST pour traiter la connexion admin
router.post('/login', redirectIfAuthenticated, async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
        return res.render('public-admin/login', { 
            error: 'Username et mot de passe requis',
            success: null
        });
    }

    try {
        // Chercher l'utilisateur par username (on utilise le champ email du formulaire comme username)
        const user = await User.findOne({
            where: { username: email }
        });

        if (!user) {
            return res.render('public-admin/login', { 
                error: 'Username ou mot de passe incorrect',
                success: null
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.render('public-admin/login', { 
                error: 'Username ou mot de passe incorrect',
                success: null
            });
        }

        // Vérifier si l'utilisateur est admin (roleId = 'ADMIN')
        if (user.roleId !== 'ADMIN') {
            return res.render('public-admin/login', { 
                error: 'Accès non autorisé - Permissions insuffisantes',
                success: null
            });
        }

        // Créer une session
        const authToken = crypto.randomBytes(64).toString('hex');
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + (config.session_duration * 1000));
        const generatedId = generateSnowflake();

        // Validation de la date d'expiration
        if (isNaN(expiresAt.getTime())) {
            console.error('Erreur: Date d\'expiration invalide calculée');
            req.flash('error', 'Erreur de configuration de session');
            return res.redirect('/admin/login');
        }

        await Session.create({
            id: generatedId,
            token: authToken,
            userId: user.id,
            createdAt,
            expiresAt
        });

        // Mettre à jour la dernière connexion
        await user.update({
            lastLoginAt: createdAt
        });

        // Définir le cookie avec une durée selon "se souvenir de moi"
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS en production
            maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 jours si "remember", sinon 1 jour
        };

        console.log('Login - Définition du cookie avec token:', authToken.substring(0, 10) + '...');
        console.log('Login - Options du cookie:', cookieOptions);
        
        res.cookie('adminToken', authToken, cookieOptions);
        console.log('Login - Cookie défini, redirection vers /admin');
        res.redirect('/admin');

    } catch (error) {
        console.error('Erreur lors de la connexion admin:', error);
        res.render('public-admin/login', { 
            error: 'Erreur serveur, veuillez réessayer',
            success: null
        });
    }
});

// Route pour la déconnexion admin
router.get('/logout', async (req, res) => {
    const authToken = req.cookies?.adminToken;
    
    if (authToken) {
        try {
            // Supprimer la session de la base de données
            await Session.destroy({ where: { token: authToken } });
        } catch (error) {
            console.error('Erreur lors de la suppression de session:', error);
        }
    }
    
    // Effacer le cookie
    res.clearCookie('adminToken');
    res.redirect('/admin/login?success=Déconnexion réussie');
});

// Route pour le dashboard admin (protégée)
router.get('/', requireAdminAuth, (req, res) => {
    res.render('admin/index', { user: req.user });
});

// Routes pour la gestion des pages (interface web)
router.get('/pages', requireAdminAuth, (req, res) => {
    res.render('admin/pages/index', { user: req.user });
});

router.get('/pages/edit', requireAdminAuth, (req, res) => {
    res.render('admin/pages/edit', { user: req.user, pageData: null });
});

router.get('/pages/edit/:id', requireAdminAuth, async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);
        if (!page) {
            return res.status(404).render('404', { currentPath: req.path });
        }
        res.render('admin/pages/edit', { user: req.user, pageData: page });
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Routes futures pour les autres sections admin (à implémenter)
router.get('/users', requireAdminAuth, (req, res) => {
    res.send('Gestion des utilisateurs - À implémenter');
});

router.get('/stats', requireAdminAuth, (req, res) => {
    res.send('Statistiques - À implémenter');
});

router.get('/settings', requireAdminAuth, (req, res) => {
    res.send('Paramètres - À implémenter');
});

module.exports = router;
