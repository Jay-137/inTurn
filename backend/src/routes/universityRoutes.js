const express = require('express');
const router = express.Router();
const universityController = require('../controllers/universityController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// PUT /api/university/students/:studentId/approve
router.put(
    '/students/:studentId/approve',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.approveStudent
);

// GET /api/university/students
// Supports query params: ?academicUnitId=1 & ?placementStatus=PLACED
router.get(
    '/students',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getStudents
);

module.exports = router;