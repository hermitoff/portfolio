// Core dependencies
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const speakeasy = require('speakeasy');
// Models
const { User, Session } = require('../../models/index');
// Middleware
const { authenticate } = require('../../middleware/authenticate')
// Utilities
const { generateSnowflake, verifyTwoFaCode, validateUserPassword } = require('../../utils');
// Config
const config = require('../../config');

// Create account
router.post('/create', [
    body('username')
        .isLength({ min: 1 }).withMessage('Username must be at least 1 character long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must contain only letters, numbers, and underscores, and no spaces or special characters')
        .custom(value => value === value.toLowerCase()).withMessage('Username must be in lowercase'),
    body('displayname').isLength({ min: 3 }).withMessage('Displayname must be at least 3 characters long'),
    body('email')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character (e.g., !@#$%^&*)'),
    body('tos')
        .notEmpty().withMessage('Please allow our TOS to continue')
        .isBoolean().withMessage('TOS must be set to true')
], 
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, displayname, email, password, tos } = req.body;

    if (!username && !email) {
        return res.status(400).json({ error: "Either username or email is required" });
    }

    if (!tos === true) {
        return res.status(400).json({ error: "You must agree to our TOS" });
    }

    try {
        let existingUser = null;
        if (username) {
            existingUser = await User.findOne({ where: { username } });
        }
        if (!existingUser && email) {
            existingUser = await User.findOne({ where: { email } });
        }

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: "Username already in use" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: "Email already in use" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const generatedId = generateSnowflake();
        await User.create({
            id: generatedId,
            username,
            displayname,
            email,
            password: hashedPassword
        });
        res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create account" });
    }
});

// Delete account
router.delete('/delete', [
    body('approval').notEmpty().withMessage('Approval is required' ),
    body('password').notEmpty().withMessage('Password is required')
], authenticate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findByPk(req.user.id);
        const { password, approval } = req.body
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (approval !== true) {
            return res.status(401).json({ error: 'You need to approve the account deletion' });
        }

        const isValid = await validateUserPassword(password, user, res);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password or username/email' });
        }

        if (user.isTwoFaEnabled) {
            return res.status(400).json({ error: "Cannot delete account with 2FA enabled" });
        }

        await user.destroy();
        await Session.destroy({ where: { userId: user.id } });
        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});

// Login
router.post('/login', [
    body('identifier').notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password, twoFaCode } = req.body;

    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isBanned) {
        return res.status(403).json({
            error: "Your account is banned.",
            banReason: user.banReason || "No reason provided"
        });
        }

        const isValid = await validateUserPassword(password, user, res);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password or username/email' });
        }

        if (user.isTwoFaEnabled) {
            if (!twoFaCode) {
                return res.status(400).json({ error: "2FA code is required" });
            }
            if (!verifyTwoFaCode(user.twoFaSecret, twoFaCode)) {
                return res.status(401).json({ error: "Invalid 2FA code" });
            }
        }

        const authToken = crypto.randomBytes(64).toString('hex');
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + (config.session_duration * 1000));
        const generatedId = generateSnowflake();

        // Validation de la date d'expiration
        if (isNaN(expiresAt.getTime())) {
            console.error('Erreur: Date d\'expiration invalide calculée');
            return res.status(500).json({ error: 'Configuration de session invalide' });
        }

        await Session.create({
            id: generatedId,
            token: authToken,
            userId: user.id,
            createdAt,
            expiresAt
        });
        
        await user.update({
            lastLoginAt: createdAt
        });

        res.json({ authToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to log in" });
    }
});

router.post('/logout', authenticate, async (req, res) => {
    try {
        const authToken = req.headers.authorization;
        await Session.destroy({ where: { token: authToken } });

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to logout" });
    }
});

router.post('/logout/all', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        await Session.destroy({ where: { userId: userId } });

        res.json({ message: "Logged out of all sessions successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to logout from all sessions" });
    }
});

router.get('/session', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in session' });
        }

        const sessions = await Session.findAll({ where: { userId: userId } });

        if (!sessions.length) {
            return res.status(404).json({ error: 'No sessions found for this user' });
        }

        res.json(sessions.map(session => ({
            id: session.id,
            expiresAt: session.expiresAt,
            creationAt: session.creationAt,
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/session', [
    body('id').notEmpty().withMessage('Session ID is required')
], authenticate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.body;
        const userId = req.user.id;

        const session = await Session.findOne({ where: { userId: userId, id: id } });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or does not belong to this user.' });
        }

        await session.destroy();

        return res.status(200).json({ message: 'Session successfully deleted.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get user data
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['username', 'displayname', 'email', 'bio', 'createdAt', 'updatedAt', 'isTwoFaEnabled', 'roleId', 'isBanned', 'banReason', 'lastLoginAt']
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to get data" });
    }
});

// Route to update his profile information
router.put('/update-profile', authenticate, [
    body('username')
        .optional()
        .isLength({ min: 1 }).withMessage('Username must be at least 1 character long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must contain only letters, numbers, and underscores')
        .custom(value => value === value.toLowerCase()).withMessage('Username must be in lowercase'),

    body('displayname')
        .optional()
        .isLength({ min: 3 }).withMessage('Displayname must be at least 3 characters long'),

    body('email')
        .optional()
        .isEmail().withMessage('Invalid email format'),

    body('password')
        .optional()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character'),

    body('currentPassword')
        .if(body('password').exists())
        .notEmpty().withMessage('Current password is required to change your password'),

    body('bio')
        .optional()
        .isLength({ max: 250 }).withMessage('Bio must be at most 250 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { username, displayname, email, password, bio, currentPassword } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ error: "Username already in use" });
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingEmailUser = await User.findOne({ where: { email } });
            if (existingEmailUser) {
                return res.status(400).json({ error: "Email already in use" });
            }
            user.email = email;
        }

        if (typeof displayname !== "undefined") {
            user.displayname = displayname;
        }

        if (typeof bio !== "undefined") {
            user.bio = bio;
        }

        if (password) {
            const isValid = await validateUserPassword(currentPassword, user);
            if (!isValid) {
                return res.status(403).json({ error: "Current password is incorrect" });
            }
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update profile" });
    }
});

router.post('/2fa', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.isTwoFaEnabled) {
            return res.status(400).json({ error: "2FA is already enabled" });
        }

        const userTwoFaSecret = speakeasy.generateSecret({
            name: config.product_name
        }).base32;

        await user.update({
            twoFaSecret: userTwoFaSecret,
            isTwoFaEnabled: true
        });

        const qrCodeData = `otpauth://totp/${encodeURIComponent(config.product_name)}:${user.username}?secret=${userTwoFaSecret}&issuer=${encodeURIComponent(config.product_name)}`;
        res.json({ qrCodeData, twoFaSecret: userTwoFaSecret });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to setup 2FA" });
    }
});

router.delete('/2fa', [
    body('password').notEmpty().withMessage('Password is required'),
    body('twoFaCode').notEmpty().withMessage('2FA code is required')
], authenticate, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { password, twoFaCode } = req.body;

        const isValid = await validateUserPassword(password, user);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        if (user.isTwoFaEnabled) {
            if (!twoFaCode) {
                return res.status(400).json({ error: "2FA code is required" });
            }
            if (!verifyTwoFaCode(user.twoFaSecret, twoFaCode)) {
                return res.status(401).json({ error: "Invalid 2FA code" });
            }
        } else {
            return res.status(400).json({ error: "2FA is already disabled" });
        }

        await user.update({
            twoFaSecret: null,
            isTwoFaEnabled: false
        });

        res.json({ message: "2FA has been disabled successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to disable 2FA" });
    }
});

module.exports = router;