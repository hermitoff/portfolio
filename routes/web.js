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

module.exports = router;