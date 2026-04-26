const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole, requireOwnershipOrAdmin } = require('../middlewares/auth');

// POST /api/students -> Create basic profile
router.post(
    '/',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.createProfile
);

// PUT /api/students -> Update profile (e.g. videoResumeUrl)
router.put(
    '/',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.updateProfile
);

// --- Notifications ---
router.get('/notifications', authenticateToken, studentController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, studentController.markNotificationRead);

// GET /api/students/:userId -> View profile
router.get(
    '/:userId',
    authenticateToken,
    requireRole(['STUDENT', 'UNIVERSITY', 'RECRUITER']),
    studentController.getProfile
);

// POST /api/students/platform/request -> Generate verification token
router.post(
    '/platform/request',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.requestPlatformVerification
);

// POST /api/students/platform/verify -> Verify token and fetch initial stats
router.post(
    '/platform/verify',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.verifyPlatform
);

// DELETE /api/students/platform/:platform -> Disconnect platform
router.delete(
    '/platform/:platform',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.removePlatform
);

// POST /api/students/skills/generate -> Generate vectors
router.post(
    '/skills/generate',
    authenticateToken,
    requireRole(['STUDENT']),
    studentController.generateSkills);
// --- Experiences ---
router.post('/experience', authenticateToken, requireRole(['STUDENT']), studentController.addExperience);
router.delete('/experience/:id', authenticateToken, requireRole(['STUDENT']), studentController.removeExperience);

// --- Certifications ---
router.post('/certification', authenticateToken, requireRole(['STUDENT']), studentController.addCertification);
router.delete('/certification/:id', authenticateToken, requireRole(['STUDENT']), studentController.removeCertification);

// --- Soft Skills ---
router.post('/softskills', authenticateToken, requireRole(['STUDENT']), studentController.updateSoftSkills);


module.exports = router;