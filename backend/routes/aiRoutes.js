// routes/aiRoutes.js
// ============================================================
// AI Routes — POST /api/ai/suggest
// Protected: requires valid JWT token
// ============================================================

const express   = require('express');
const { body }  = require('express-validator');
const aiCtrl    = require('../controllers/aiController');

const router = express.Router();

// Validate the task data sent for AI suggestion
const validateSuggest = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required.')
    .isLength({ max: 255 }).withMessage('Title too long.'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 5000 }).withMessage('Description too long.'),
];

// POST /api/ai/suggest — generate AI suggestion for a task
router.post('/suggest', validateSuggest, aiCtrl.suggestTask);

module.exports = router;
