const prisma = require('../utils/prisma');

// [UNIVERSITY ONLY] Approve a student's registration
const approveStudent = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);

        const student = await prisma.student.findUnique({ 
            where: { id: studentId } 
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        if (student.registrationStatus === 'APPROVED') {
            return res.status(400).json({ error: 'Student registration is already approved.' });
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { registrationStatus: 'APPROVED' }
        });

        res.status(200).json({ 
            message: 'Student registration approved successfully.', 
            student: updatedStudent 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve student registration.' });
    }
};

// [UNIVERSITY ONLY] View student roster with pagination, filtering, sorting
const getStudents = async (req, res) => {
    try {
        const { 
            academicUnitId, placementStatus, registrationStatus,
            branch, minCgpa, maxCgpa,
            search, searchType, // searchType: 'name' | 'email' | 'uid' | 'phone'
            sortBy, sortDir,    // sortBy: 'cgpa' | 'name' | 'branch', sortDir: 'asc' | 'desc'
            page, pageSize
        } = req.query;
        
        // Build dynamic where clause
        const whereClause = {};
        
        if (academicUnitId) {
            whereClause.academicUnitId = parseInt(academicUnitId, 10);
        }
        
        if (placementStatus) {
            whereClause.placementStatus = placementStatus.toUpperCase();
        }

        if (registrationStatus) {
            whereClause.registrationStatus = registrationStatus.toUpperCase();
        }

        if (branch) {
            whereClause.branch = branch;
        }

        if (minCgpa || maxCgpa) {
            whereClause.cgpa = {};
            if (minCgpa) whereClause.cgpa.gte = parseFloat(minCgpa);
            if (maxCgpa) whereClause.cgpa.lte = parseFloat(maxCgpa);
        }

        // Search across user name/email
        if (search && search.trim()) {
            const q = search.trim();
            if (searchType === 'email') {
                whereClause.user = { email: { contains: q } };
            } else if (searchType === 'uid') {
                // Search by student id
                const parsed = parseInt(q, 10);
                if (!isNaN(parsed)) whereClause.id = parsed;
            } else {
                // Default: search by name
                whereClause.user = { name: { contains: q } };
            }
        }

        // Sorting
        let orderBy = { cgpa: 'desc' }; // default
        if (sortBy === 'name') {
            orderBy = { user: { name: sortDir === 'asc' ? 'asc' : 'desc' } };
        } else if (sortBy === 'branch') {
            orderBy = { branch: sortDir === 'asc' ? 'asc' : 'desc' };
        } else if (sortBy === 'cgpa') {
            orderBy = { cgpa: sortDir === 'asc' ? 'asc' : 'desc' };
        }

        // Pagination
        const pg = parseInt(page, 10) || 1;
        const ps = Math.min(parseInt(pageSize, 10) || 10, 50); // cap at 50
        const skip = (pg - 1) * ps;

        // Total count for pagination
        const totalCount = await prisma.student.count({ where: whereClause });

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true } },
                academicUnit: { select: { name: true, type: true } },
                skills: { include: { skill: true } }
            },
            orderBy,
            skip,
            take: ps
        });

        res.status(200).json({
            students,
            totalCount,
            page: pg,
            pageSize: ps,
            totalPages: Math.ceil(totalCount / ps)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student roster.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const universityId = parseInt(req.query.universityId || req.user?.id); // In real app derive from req.user
        
        const totalStudents = await prisma.student.count();
        const totalApplications = await prisma.application.count();
        const shortlistedApps = await prisma.application.count({
            where: { matchScore: { gte: 75 } }
        });
        
        const shortlistRate = totalApplications > 0 ? Math.round((shortlistedApps / totalApplications) * 100) : 0;
        
        const offersExtended = await prisma.placementSelection.count({
            where: { status: { in: ['SELECTED_BY_RECRUITER', 'APPROVED_BY_UNIVERSITY'] } }
        });

        res.json({
            totalApplicants: totalStudents,
            shortlistRate,
            offersExtended
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch university stats.' });
    }
}

// [UNIVERSITY ONLY] Create an extra data request field
const createDataRequest = async (req, res) => {
    try {
        const { fieldName, fieldType, isRequired } = req.body;
        // In a real app, universityId comes from req.user. For prototype, we'll hardcode 1 since there's only 1 university.
        const universityId = 1; 

        const request = await prisma.universityDataRequest.create({
            data: { universityId, fieldName, fieldType, isRequired: isRequired ?? true }
        });

        res.status(201).json({ message: 'Data request field created', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create data request.' });
    }
};

// [UNIVERSITY ONLY] Get all extra data requests
const getDataRequests = async (req, res) => {
    try {
        const universityId = 1; // Prototype single university
        const requests = await prisma.universityDataRequest.findMany({
            where: { universityId }
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data requests.' });
    }
};

// [STUDENT/UNIVERSITY] Get a student's extra data
const getStudentExtraData = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);
        const data = await prisma.studentExtraData.findMany({
            where: { studentId },
            include: { request: true }
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student extra data.' });
    }
};

// [STUDENT] Submit extra data
const submitExtraData = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const { requestId, value } = req.body;

        const extraData = await prisma.studentExtraData.upsert({
            where: {
                studentId_requestId: {
                    studentId: student.id,
                    requestId: parseInt(requestId, 10)
                }
            },
            update: { value },
            create: { studentId: student.id, requestId: parseInt(requestId, 10), value }
        });

        res.json({ message: 'Data submitted successfully', extraData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit extra data.' });
    }
};

module.exports = { 
    approveStudent, 
    getStudents, 
    getDashboardStats,
    createDataRequest,
    getDataRequests,
    getStudentExtraData,
    submitExtraData
};