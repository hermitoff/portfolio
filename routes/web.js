const express = require('express');
const router = express.Router();
const cvdata = require('../data/cv.json');
const renderSection = require('../utils/cv');

// Route pour la page d'accueil
router.get('/', (req, res) => {

    res.render('index', {  });
});
// Route pour la page du CV
router.get('/cv', (req, res) => {

    res.render('cv', {
        cvdata: cvdata,
        renderSection
    });
});

module.exports = router;