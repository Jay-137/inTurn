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

module.exports = router;