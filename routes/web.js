const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// Middleware pour injecter les pages visibles et publiées dans toutes les vues
router.use(async (req, res, next) => {
    try {
        const navPages = await Page.findAll({
            where: {
                visibleInNav: true,
                published: true
            },
            order: [['createdAt', 'ASC']]
        });
        // On retire la page d'accueil (id 'index') de la navigation
        res.locals.navPages = navPages.filter(page => page.id !== 'index');
    } catch (err) {
        res.locals.navPages = [];
    }
    next();
});

// Route pour la page d'accueil
router.get('/', async (req, res) => {
    const page = await Page.findByPk('index');
    if (!page || !page.published) return res.render('404', { currentPath: req.path });
    res.render('model', { page, currentPath: req.path });
});

// Route dynamique, mais on bloque /index
router.get('/:id', async (req, res) => {
    if (req.params.id === 'index') {
        return res.status(404).render('404', { currentPath: req.path });
    }
    const page = await Page.findByPk(req.params.id);
    if (!page || !page.published) return res.render('404', { currentPath: req.path });
    res.render('model', { page, currentPath: req.path });
});

module.exports = router;