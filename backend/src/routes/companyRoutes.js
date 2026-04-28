const express = require('express');
const { 
    getCompanyProfile, postJob, getJobApplicants, getDashboardStats, 
    getShortlistedCandidates, updateApplicantStatus, getNotifications, 
    markNotificationRead, deleteNotification, clearAllNotifications, 
    withdrawJob, massUpdateApplicantStatus
} = require('../controllers/companyController');
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
router.put('/jobs/:jobId/withdraw', withdrawJob);

// Applicant actions
router.put('/jobs/applications/bulk', massUpdateApplicantStatus);
router.put('/jobs/applications/:id/status', updateApplicantStatus);

// Analytics
router.get('/dashboard', getDashboardStats);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);
router.delete('/notifications', clearAllNotifications);

module.exports = router;
