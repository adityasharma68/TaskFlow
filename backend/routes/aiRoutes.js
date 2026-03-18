// routes/aiRoutes.js
const express         = require('express');
const { body }        = require('express-validator');
const { suggestTask } = require('../controllers/aiController');

const router = express.Router();

router.post('/suggest', [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required.')
    .isLength({ max: 255 }).withMessage('Title too long.'),
], suggestTask);

module.exports = router;
