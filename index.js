const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan')
// Import config
const config = require('./config');
// Import routes
const webRoutes = require('./routes/web');

// Middleware to parse JSON bodies
app.use(express.json());

// Config EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Expose static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('common'));

app.use('/', webRoutes);

app.listen(config.port, () => {
    console.log(`SYSTEM: Server is running on port: ${config.port}`);
});