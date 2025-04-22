// ! This is NOT a config file ! Use /config/.env
require('dotenv').config({ path: './config/.env' });
const fs = require('fs');
const path = require('path');

// Detection of .env file
const envPath = path.resolve(__dirname, './config/.env');
const allowEnvLess = process.argv.includes('-allowenvless');

if (!fs.existsSync(envPath) && !allowEnvLess) {
    console.error('SYSTEM: .env is missing.');
    process.exit(1);
}

// Check required environment variables
const requiredEnvVars = [
    'PORT'
];

const unsetEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// Validation of PORT
const port = parseInt(process.env.PORT, 10);
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('SYSTEM: PORT must be a valid port number (1-65535).');
}

// Export variables
module.exports = {
    port
};