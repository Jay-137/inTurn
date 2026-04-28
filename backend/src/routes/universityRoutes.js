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

// PUT /api/university/students/:studentId/reject
router.put(
    '/students/:studentId/reject',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.rejectStudent
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
    authenticateToken,
    requireRole(['UNIVERSITY']),
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
    '/data-requests/submissions',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getExtraDataSubmissions
);

router.put(
    '/data-requests/submissions/:id/status',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.updateExtraDataSubmissionStatus
);

router.delete(
    '/data-requests/:id',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.deleteDataRequest
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

// --- Applications, Companies, Jobs, Academic Units ---
router.get(
    '/applications',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getAllApplications
);

router.get(
    '/companies',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getCompanies
);

router.get(
    '/academic-units/tree',
    authenticateToken,
    requireRole(['UNIVERSITY', 'STUDENT', 'RECRUITER']),
    universityController.getAcademicUnitTree
);

router.post(
    '/academic-units',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.createAcademicUnit
);

router.put(
    '/academic-units/:id',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.updateAcademicUnit
);

router.delete(
    '/academic-units/:id',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.deleteAcademicUnit
);

router.get(
    '/jobs/pending',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getPendingJobs
);

router.put(
    '/jobs/:jobId/status',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.updateJobStatus
);

router.get(
    '/settings',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getSettings
);

router.put(
    '/settings',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.updateSettings
);

router.get(
    '/certifications',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getCertifications
);

router.put(
    '/certifications/:id/verify',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.verifyCertification
);

// --- Application Review (University-mediated flow) ---
router.get(
    '/applications/pending',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getPendingApplications
);

router.put(
    '/applications/:id/approve',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.approveApplication
);

router.put(
    '/applications/:id/reject',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.rejectApplication
);

router.post(
    '/applications/mass-forward/:jobId',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.massForwardApplications
);

router.put(
    '/applications/bulk',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.massUpdateApplications
);

router.post(
    '/students/:studentId/placement',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.markStudentPlaced
);

router.delete(
    '/students/:studentId/placement',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.unmarkStudentPlaced
);

router.get(
    '/students/:studentId/shortlisted-companies',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getShortlistedCompaniesForStudent
);

router.get(
    '/companies-and-jobs',
    authenticateToken,
    requireRole(['UNIVERSITY']),
    universityController.getAllCompaniesAndJobs
);

module.exports = router;
