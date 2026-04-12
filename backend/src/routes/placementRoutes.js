const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// POST /api/placements/select -> Recruiters only
router.post(
    '/select', 
    authenticateToken, 
    requireRole(['RECRUITER']), 
    placementController.selectCandidate
);

// PUT /api/placements/:selectionId/approve -> University Admin only
router.put(
    '/:selectionId/approve', 
    authenticateToken, 
    requireRole(['UNIVERSITY']), 
    placementController.approvePlacement
);

module.exports = router;