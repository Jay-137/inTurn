const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Layer 1: Authentication (Is the token valid?)
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch fresh user data to ensure they still exist and haven't been banned/deleted
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true } // Only pull what we need for auth
        });

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Layer 2: Role-Based Access (Are they allowed here?)
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` 
            });
        }
        next();
    };
};

// Layer 3: Resource Ownership (Are they snooping on someone else?)
// We use this on routes like GET /api/students/:userId
const requireOwnershipOrAdmin = (paramKey = 'userId') => {
    return (req, res, next) => {
        const requestedId = parseInt(req.params[paramKey], 10);
        
        // University Admins have global read access
        if (req.user.role === 'UNIVERSITY') {
            return next();
        }

        // For Students and Recruiters, their token ID MUST match the requested ID
        if (req.user.id !== requestedId) {
            return res.status(403).json({ 
                error: 'Privacy violation. You do not have permission to access this specific data.' 
            });
        }
        
        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnershipOrAdmin
};