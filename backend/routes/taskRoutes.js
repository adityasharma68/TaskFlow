// routes/taskRoutes.js
// ============================================================
// Task Routes – Maps HTTP verbs + paths to Controller methods.
// Inline validation rules (express-validator) live here too.
// ============================================================

const express  = require('express');
const { body, param } = require('express-validator');
const ctrl     = require('../controllers/taskController');

const router   = express.Router();

// ── Reusable validation chains ─────────────────────────────

/** Validates the numeric :id route parameter */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer.'),
];

/** Validates the request body for create / update */
const validateTaskBody = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title must be ≤ 255 characters.'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 5000 }).withMessage('Description must be ≤ 5000 characters.'),

  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Due date must be in YYYY-MM-DD format.'),

  body('status')
    .optional()
    .isIn(['Pending', 'Completed']).withMessage('Status must be "Pending" or "Completed".'),

  body('created_by')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Created By must be ≤ 100 characters.'),

  body('updated_by')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Updated By must be ≤ 100 characters.'),
];

// ── Route Definitions ───────────────────────────────────────

/**
 * GET /tasks/search?q=keyword
 * Must be declared BEFORE /tasks/:id to avoid "search" being
 * treated as an :id parameter.
 */
router.get('/search', ctrl.searchTasks);

/** GET /tasks – Retrieve all tasks */
router.get('/', ctrl.getAllTasks);

/** GET /tasks/:id – Retrieve a single task */
router.get('/:id', validateId, ctrl.getTaskById);

/** POST /tasks – Create a new task */
router.post('/', validateTaskBody, ctrl.createTask);

/** PUT /tasks/:id – Update an existing task */
router.put('/:id', [...validateId, ...validateTaskBody], ctrl.updateTask);

/** DELETE /tasks/:id – Delete a task */
router.delete('/:id', validateId, ctrl.deleteTask);

module.exports = router;
