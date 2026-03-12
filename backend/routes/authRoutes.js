// routes/authRoutes.js
// ============================================================
// Auth Routes – /auth/register, /auth/login, /auth/me
// ============================================================

const express         = require('express');
const { body }        = require('express-validator');
const authCtrl        = require('../controllers/authController');
const authMiddleware  = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be ≤ 100 characters.'),
  body('email').trim().isEmail().withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// Routes
router.post('/register', registerRules, authCtrl.register);
router.post('/login',    loginRules,    authCtrl.login);
router.get('/me',        authMiddleware, authCtrl.getMe);

module.exports = router;
