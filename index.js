const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// Import config
const config = require('./config');
// Import routes
const Routes = require('./routes/routes');
// Import database sync
const { syncDatabase } = require('./syncDb');

// Middleware to parse JSON bodies and URL-encoded forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Pour gérer les cookies

// Config EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Expose static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('common'));

app.use('/', Routes);


// Synchronisation automatique de la base de données avant de démarrer le serveur
syncDatabase({ force: false, alter: false })
    .then(() => {
        app.listen(config.port, () => {
            console.log(`SYSTEM: Server is running on port: ${config.port}`);
        });
    })
    .catch((err) => {
        console.error('DATABASE: Failed to sync database. Server not started.');
        process.exit(1);
    });