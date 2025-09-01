const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');

function verifyTwoFaCode(secret, token) {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
}

async function validateUserPassword(password, user) {
    return await bcrypt.compare(password, user.password);
}

module.exports = {
    verifyTwoFaCode,
    validateUserPassword
};