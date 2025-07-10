const express = require('express');
const router = express.Router();

// Route pour la page d'accueil
router.get('/', (req, res) => {
    res.render('index', { currentPath: req.path });
});

// Route pour la page du CV
router.get('/cv', (req, res) => {
    res.render('cv', { currentPath: req.path } );
});

// Route pour la page des projets
router.get('/projets', (req, res) => {
    res.render('projets', { currentPath: req.path } );
});

// Route pour la page du parcours
router.get('/parcours', (req, res) => {
    res.render('parcours', { currentPath: req.path } );
});

// Route pour la page des compétences
router.get('/competences', (req, res) => {
    res.render('competences', { currentPath: req.path } );
});

// Route pour la page de contact
router.get('/contact', (req, res) => {
    res.render('contact', { currentPath: req.path } );
});

module.exports = router;