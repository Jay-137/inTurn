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

// GET /api/university/dashboard
router.get(
    '/dashboard',
    // authenticateToken, // For prototype, might be easier if we can fetch this or use dummy token
    // requireRole(['UNIVERSITY']),
    universityController.getDashboardStats
);

// --- Extra Data Requests (University Side) ---
router.post(
    '/data-requests',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.createDataRequest
);

router.get(
    '/data-requests',
    authenticateToken,
    requireRole(['UNIVERSITY', 'STUDENT']), // Students need to see what's requested
    universityController.getDataRequests
);

router.get(
    '/students/:studentId/extra-data',
    authenticateToken,
    requireRole(['UNIVERSITY', 'STUDENT']), // University checks, student views their own
    universityController.getStudentExtraData
);

// --- Extra Data Submission (Student Side) ---
router.post(
    '/students/extra-data',
    authenticateToken,
    requireRole(['STUDENT']),
    universityController.submitExtraData
);

module.exports = router;