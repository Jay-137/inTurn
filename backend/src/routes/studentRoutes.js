const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middlewares/auth');

// POST /api/students
// Only a logged-in STUDENT can create a profile for themselves
router.post(
    '/',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.createProfile
);

// GET /api/students/:userId
// 1. Must be logged in
// 2. Must be a STUDENT or UNIVERSITY (Recruiters use a different flow to see candidates)
// 3. If Student, the JWT ID must match the :userId in the URL
router.get(
    '/:userId',
    authenticateToken,
    requireRole(['STUDENT', 'UNIVERSITY']),
    requireOwnershipOrAdmin('userId'), 
    studentController.getProfile
);

module.exports = router;