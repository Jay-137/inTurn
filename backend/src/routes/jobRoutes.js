const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// POST /api/jobs -> Recruiters only (Moved to /api/companies/jobs)

// GET /api/jobs -> Anyone authenticated can view jobs
router.get('/', authenticateToken, jobController.getJobs);

// POST /api/jobs/:jobId/apply -> Students only
router.post('/:jobId/apply', authenticateToken, requireRole(['STUDENT']), jobController.applyForJob);

module.exports = router;