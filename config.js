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
    'PORT',
    'SESSION_DURATION'
];

const unsetEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// Validation of PORT
const port = parseInt(process.env.PORT, 10);
if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('SYSTEM: PORT must be a valid port number (1-65535).');
}

// Validation of SESSION_DURATION
const session_duration = parseInt(process.env.SESSION_DURATION, 10);
if (isNaN(session_duration) || session_duration < 1) {
    throw new Error('SYSTEM: SESSION_DURATION must be a valid number (in seconds).');
}

// Export variables
module.exports = {
    port,
    session_duration
};