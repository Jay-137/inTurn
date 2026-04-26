const express = require('express');
const { getCompanyProfile, postJob, getJobApplicants, getDashboardStats, getShortlistedCandidates } = require('../controllers/companyController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all recruiter routes
router.use(authenticateToken);

// Company Profile
router.get('/profile', getCompanyProfile);

// Job Management
router.post('/jobs', postJob);
router.get('/jobs/shortlisted', getShortlistedCandidates);
router.get('/jobs/:jobId/applicants', getJobApplicants);

// Analytics
router.get('/dashboard', getDashboardStats);

module.exports = router;
