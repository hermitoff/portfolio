const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// Route pour la page d'accueil
router.get('/', async (req, res) => {
    const page = await Page.findByPk('index');
    if (!page) return res.render('404', { currentPath: req.path });
    res.render('model', { page, currentPath: req.path });
});

// Route dynamique, mais on bloque /index
router.get('/:id', async (req, res) => {
    if (req.params.id === 'index') {
        return res.status(404).render('404', { currentPath: req.path });
    }
    const page = await Page.findByPk(req.params.id);
    if (!page) return res.render('404', { currentPath: req.path });
    res.render('model', { page, currentPath: req.path });
});

module.exports = router;