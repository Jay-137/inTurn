const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// GET /api/analytics/university -> University Admin only
router.get(
    '/university', 
    authenticateToken, 
    requireRole(['UNIVERSITY']), 
    analyticsController.getUniversityStats
);

// GET /api/analytics/jobs/:jobId/applicants -> Recruiters only
router.get(
    '/jobs/:jobId/applicants', 
    authenticateToken, 
    requireRole(['RECRUITER']), 
    analyticsController.getJobApplicants
);

// GET /api/analytics/students -> University Admin only
router.get(
    '/students', 
    authenticateToken, 
    requireRole(['UNIVERSITY']), 
    analyticsController.getStudentAnalytics
);

// GET /api/analytics/recruiters -> University Admin only
router.get(
    '/recruiters', 
    authenticateToken, 
    requireRole(['UNIVERSITY']), 
    analyticsController.getRecruiterAnalytics
);

module.exports = router;