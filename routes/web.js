const express = require('express');
const router = express.Router();

// Route pour la page d'accueil
router.get('/', (req, res) => {
    res.render('index', {  });
});

// Route pour la page du CV
router.get('/cv', (req, res) => {
    res.render('cv', {} );
});

// Route pour la page des projets
router.get('/projets', (req, res) => {
    res.render('projets', {} );
});

// Route pour la page du parcours
router.get('/parcours', (req, res) => {
    res.render('parcours', {} );
});

// Route pour la page des compétences
router.get('/competences', (req, res) => {
    res.render('competences', {} );
});

// Route pour la page de contact
router.get('/contact', (req, res) => {
    res.render('contact', {} );
});

module.exports = router;