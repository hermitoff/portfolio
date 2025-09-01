const express = require('express');
const router = express.Router();
const { Page } = require('../../models/index');
const { verifyToken } = require('../../middleware/authenticate');

// Middleware pour vérifier l'authentification admin via cookie
const requireAdminAuth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le cookie
        const authToken = req.cookies?.adminToken;
        
        if (!authToken) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        
        const user = await verifyToken(authToken);
        if (!user) {
            return res.status(401).json({ error: 'Token invalide' });
        }
        
        if (user.roleId !== 'ADMIN') {
            return res.status(403).json({ error: 'Accès refusé - Permissions administrateur requises' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ error: 'Erreur d\'authentification' });
    }
};

// GET - Lister toutes les pages
router.get('/pages', requireAdminAuth, async (req, res) => {
    try {
        const pages = await Page.findAll({
            order: [['updatedAt', 'DESC']]
        });
        res.json(pages);
    } catch (error) {
        console.error('Erreur lors de la récupération des pages:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET - Récupérer une page spécifique
router.get('/pages/:id', requireAdminAuth, async (req, res) => {
    try {
        const page = await Page.findByPk(req.params.id);
        if (!page) {
            return res.status(404).json({ error: 'Page non trouvée' });
        }
        res.json(page);
    } catch (error) {
        console.error('Erreur lors de la récupération de la page:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Créer une nouvelle page
router.post('/pages', requireAdminAuth, async (req, res) => {
    try {
        const { id, title, description, content, published, visibleInNav } = req.body;
        
        // Validation des données
        if (!id || !title) {
            return res.status(400).json({ error: 'ID et titre sont requis' });
        }
        
        // Vérifier si une page avec cet ID existe déjà
        const existingPage = await Page.findByPk(id);
        if (existingPage) {
            return res.status(400).json({ error: 'Une page avec cet ID existe déjà' });
        }
        
        // Créer la page
        const page = await Page.create({
            id,
            title,
            description: description || null,
            content: content || '',
            published: Boolean(published),
            visibleInNav: Boolean(visibleInNav)
        });
        
        res.status(201).json(page);
    } catch (error) {
        console.error('Erreur lors de la création de la page:', error);
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({ error: 'Données invalides', details: error.errors });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// PUT - Mettre à jour une page
router.put('/pages/:id', requireAdminAuth, async (req, res) => {
    try {
        const { title, description, content, published, visibleInNav } = req.body;
        const pageId = req.params.id;
        
        // Validation des données
        if (!title) {
            return res.status(400).json({ error: 'Le titre est requis' });
        }
        
        // Trouver la page
        const page = await Page.findByPk(pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page non trouvée' });
        }
        
        // Mettre à jour la page
        await page.update({
            title,
            description: description || null,
            content: content || '',
            published: Boolean(published),
            visibleInNav: Boolean(visibleInNav)
        });
        
        res.json(page);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la page:', error);
        if (error.name === 'SequelizeValidationError') {
            res.status(400).json({ error: 'Données invalides', details: error.errors });
        } else {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

// DELETE - Supprimer une page
router.delete('/pages/:id', requireAdminAuth, async (req, res) => {
    try {
        const pageId = req.params.id;
        
        // Trouver la page
        const page = await Page.findByPk(pageId);
        if (!page) {
            return res.status(404).json({ error: 'Page non trouvée' });
        }
        
        // Empêcher la suppression de la page d'accueil
        if (pageId === 'index') {
            return res.status(400).json({ error: 'La page d\'accueil ne peut pas être supprimée' });
        }
        
        // Supprimer la page
        await page.destroy();
        
        res.json({ message: 'Page supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la page:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
