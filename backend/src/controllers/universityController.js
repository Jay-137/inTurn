const prisma = require('../utils/prisma');
const { branchesMatch } = require('../services/engine/eligibilityEngine');

const studentBranchLabel = (student) => (
    student.branch || student.academicUnit?.name || 'Unassigned'
);

const buildBranchStats = (students) => {
    const stats = new Map();

    students.forEach((student) => {
        const label = studentBranchLabel(student);
        const current = stats.get(label) || { label, total: 0, placed: 0, pct: 0 };
        current.total += 1;
        if (student.placementStatus === 'PLACED') current.placed += 1;
        stats.set(label, current);
    });

    return Array.from(stats.values())
        .map((entry) => ({
            ...entry,
            pct: entry.total > 0 ? Math.round((entry.placed / entry.total) * 100) : 0
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
};

const collectDescendantUnitIds = (unitId, childrenByParent) => {
    const ids = [unitId];
    const children = childrenByParent.get(unitId) || [];

    children.forEach((child) => {
        ids.push(...collectDescendantUnitIds(child.id, childrenByParent));
    });

    return ids;
};

const resolveStudentAcademicUnitId = (student, unitById, childrenByParent) => {
    const assignedUnit = unitById.get(student.academicUnitId);
    if (!assignedUnit || !student.branch) return student.academicUnitId;

    const descendantUnitIds = collectDescendantUnitIds(assignedUnit.id, childrenByParent);
    const matchingDescendant = descendantUnitIds
        .map((id) => unitById.get(id))
        .filter(Boolean)
        .find((unit) => unit.id !== assignedUnit.id && branchesMatch(student.branch, unit.name));

    return matchingDescendant?.id || student.academicUnitId;
};

const academicUnitPath = (unit, unitById) => {
    const path = [];
    let current = unit;

    while (current) {
        path.unshift(current.name);
        current = current.parentId ? unitById.get(current.parentId) : null;
    }

    return path;
};

const resolvedPlacementBranch = (student, unitById) => {
    if (student.branch) return student.branch;

    let current = unitById.get(student.academicUnitId);
    let fallback = current?.name || 'Unassigned';

    while (current) {
        const type = String(current.type || '').toUpperCase();
        if (['DEPARTMENT', 'STREAM', 'BRANCH', 'PROGRAM', 'PROGRAMME', 'COURSE'].includes(type)) {
            return current.name;
        }
        current = current.parentId ? unitById.get(current.parentId) : null;
    }

    return fallback;
};

const decorateStudentForUniversity = (student, unitById, childrenByParent) => {
    const resolvedAcademicUnitId = resolveStudentAcademicUnitId(student, unitById, childrenByParent);
    const resolvedUnit = unitById.get(resolvedAcademicUnitId) || unitById.get(student.academicUnitId);
    const path = academicUnitPath(resolvedUnit, unitById);
    const originalUnit = unitById.get(student.academicUnitId);

    return {
        ...student,
        placementBranch: resolvedPlacementBranch({ ...student, academicUnitId: resolvedAcademicUnitId }, unitById),
        academicPath: path,
        academicUnit: resolvedUnit
            ? { id: resolvedUnit.id, name: resolvedUnit.name, type: resolvedUnit.type }
            : student.academicUnit,
        originalAcademicUnit: originalUnit
            ? { id: originalUnit.id, name: originalUnit.name, type: originalUnit.type }
            : student.academicUnit
    };
};

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

// [UNIVERSITY ONLY] Reject a student's registration
const rejectStudent = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);
        const { reason } = req.body;

        const student = await prisma.student.findUnique({ 
            where: { id: studentId } 
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: { 
                registrationStatus: 'REJECTED',
                rejectionReason: reason || 'Did not meet requirements'
            }
        });

        res.status(200).json({ 
            message: 'Student registration rejected.', 
            student: updatedStudent 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reject student registration.' });
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
        
        const units = await prisma.academicUnit.findMany({ select: { id: true, name: true, type: true, parentId: true } });
        const unitById = new Map(units.map((unit) => [unit.id, unit]));
        const childrenByParent = new Map();
        units.forEach((unit) => {
            const key = unit.parentId || null;
            const children = childrenByParent.get(key) || [];
            children.push(unit);
            childrenByParent.set(key, children);
        });
        const academicUnitFilterId = academicUnitId ? parseInt(academicUnitId, 10) : null;
        const academicUnitFilterIds = academicUnitFilterId
            ? collectDescendantUnitIds(academicUnitFilterId, childrenByParent)
            : null;
        const academicUnitFilterNames = academicUnitFilterIds
            ? academicUnitFilterIds.map((id) => unitById.get(id)?.name).filter(Boolean)
            : [];

        // Build dynamic where clause
        const whereClause = {};
        
        if (placementStatus) {
            whereClause.placementStatus = placementStatus.toUpperCase();
        }

        if (registrationStatus) {
            whereClause.registrationStatus = registrationStatus.toUpperCase();
        }

        if (branch) {
            whereClause.OR = [
                { branch },
                { academicUnit: { name: branch } }
            ];
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

        const allMatchingStudents = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true } },
                academicUnit: { select: { id: true, name: true, type: true } },
                skills: { include: { skill: true } }
            },
            orderBy
        });

        const academicFilteredStudents = academicUnitFilterIds
            ? allMatchingStudents.filter((student) => (
                academicUnitFilterIds.includes(student.academicUnitId) ||
                academicUnitFilterNames.some((unitName) => branchesMatch(student.branch, unitName))
            ))
            : allMatchingStudents;

        const totalCount = academicFilteredStudents.length;
        const students = academicFilteredStudents
            .slice(skip, skip + ps)
            .map((student) => decorateStudentForUniversity(student, unitById, childrenByParent));

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
        const totalStudents = await prisma.student.count();
        const placedStudents = await prisma.student.count({
            where: { placementStatus: 'PLACED' }
        });
        const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;
        const totalApplications = await prisma.application.count();
        const shortlistedApps = await prisma.application.count({
            where: { matchScore: { gte: 75 } }
        });
        
        const shortlistRate = totalApplications > 0 ? Math.round((shortlistedApps / totalApplications) * 100) : 0;
        
        const offersExtended = await prisma.placementSelection.count({
            where: { status: { in: ['SELECTED_BY_RECRUITER', 'APPROVED_BY_UNIVERSITY'] } }
        });

        const activeJobCount = await prisma.job.count({
            where: { deadline: { gt: new Date() }, approvalStatus: 'APPROVED' }
        });

        const activeJobsList = await prisma.job.findMany({
            where: { deadline: { gt: new Date() }, approvalStatus: 'APPROVED' },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { company: true, _count: { select: { applications: true } } }
        });

        const pendingRegistrations = await prisma.student.count({
            where: { registrationStatus: 'PENDING' }
        });

        const pendingJobApprovals = await prisma.job.count({
            where: { approvalStatus: 'PENDING' }
        });

        const studentsForBranchStats = await prisma.student.findMany({
            select: {
                branch: true,
                placementStatus: true,
                academicUnit: { select: { name: true } }
            }
        });
        const placementByBranch = buildBranchStats(studentsForBranchStats);

        const topStudents = await prisma.student.findMany({
            where: { placementStatus: 'PLACED' },
            orderBy: { cgpa: 'desc' },
            take: 5,
            include: { user: true, academicUnit: true }
        });

        // Calculate average skill score
        const allSkills = await prisma.studentSkill.aggregate({
            _avg: { score: true },
            _count: { score: true }
        });
        const avgSkillScore = allSkills._avg.score ? Math.round(allSkills._avg.score * 100) : 0;
        const avgSkillScoreCount = allSkills._count.score || 0;

        const recentApplications = await prisma.application.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
                student: { include: { user: { select: { name: true } } } },
                job: { select: { title: true } }
            }
        });

        const recentPendingStudents = await prisma.student.findMany({
            where: { registrationStatus: 'PENDING' },
            take: 2,
            orderBy: { id: 'desc' },
            include: { user: { select: { name: true } } }
        });

        const recentPendingJobs = await prisma.job.findMany({
            where: { approvalStatus: 'PENDING' },
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: { company: { select: { name: true } } }
        });

        const recentActivity = [
            ...recentApplications.map((application) => ({
                id: `application-${application.id}`,
                type: 'APPLICATION',
                title: `${application.student?.user?.name || 'A student'} applied for ${application.job?.title || 'a job'}`,
                detail: application.status,
                createdAt: application.createdAt
            })),
            ...recentPendingStudents.map((student) => ({
                id: `student-${student.id}`,
                type: 'STUDENT_REGISTRATION',
                title: `${student.user?.name || 'A student'} is awaiting registration approval`,
                detail: student.registrationStatus,
                createdAt: null
            })),
            ...recentPendingJobs.map((job) => ({
                id: `job-${job.id}`,
                type: 'JOB_APPROVAL',
                title: `${job.company?.name || 'A company'} submitted ${job.title}`,
                detail: job.approvalStatus,
                createdAt: job.createdAt
            }))
        ].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        }).slice(0, 5);

        const topStudentsMapped = topStudents.map(s => ({
            name: s.user.name,
            cgpa: s.cgpa,
            branch: studentBranchLabel(s)
        }));

        res.json({
            totalApplicants: totalStudents,
            placedStudents,
            placementRate,
            avgSkillScore,
            shortlistRate,
            offersExtended,
            activeJobCount,
            activeJobsList,
            pendingRegistrations,
            pendingJobApprovals,
            placementByBranch,
            topStudents: topStudentsMapped,
            avgSkillScoreCount,
            recentActivity
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch university stats.' });
    }
}

// [UNIVERSITY ONLY] Get pending jobs requiring university approval
const getPendingJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { approvalStatus: 'PENDING' },
            include: { company: true },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending jobs.' });
    }
};

// [UNIVERSITY ONLY] Create an extra data request field
const createDataRequest = async (req, res) => {
    try {
        const { fieldName, fieldType, isRequired } = req.body;
        // In a real app, universityId comes from req.user. For prototype, we'll hardcode 1 since there's only 1 university.
        const universityId = 1; 

        const request = await prisma.universityDataRequest.create({
            data: { universityId, fieldName, fieldType, isRequired: isRequired ?? true }
        });

        const students = await prisma.student.findMany({
            where: { universityId },
            select: { userId: true }
        });

        if (students.length > 0) {
            await prisma.notification.createMany({
                data: students.map((student) => ({
                    userId: student.userId,
                    type: 'warning',
                    message: `Your university requested: ${fieldName}`
                }))
            });
        }

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

// [UNIVERSITY ONLY] Delete an extra data request
const deleteDataRequest = async (req, res) => {
    try {
        const requestId = parseInt(req.params.id, 10);
        await prisma.universityDataRequest.delete({
            where: { id: requestId }
        });
        res.status(200).json({ message: 'Data request deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete data request.' });
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
            update: { value, status: 'PENDING', reviewedAt: null, rejectionReason: null },
            create: { studentId: student.id, requestId: parseInt(requestId, 10), value, status: 'PENDING' }
        });

        res.json({ message: 'Data submitted successfully', extraData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit extra data.' });
    }
};

const getExtraDataSubmissions = async (req, res) => {
    try {
        const submissions = await prisma.studentExtraData.findMany({
            include: {
                request: true,
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        academicUnit: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });

        res.json({ submissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch extra data submissions.' });
    }
};

const updateExtraDataSubmissionStatus = async (req, res) => {
    try {
        const submissionId = parseInt(req.params.id, 10);
        const { status, rejectionReason } = req.body;
        const allowed = ['PENDING', 'APPROVED', 'REJECTED'];

        if (!allowed.includes(status)) {
            return res.status(400).json({ error: 'Invalid submission status.' });
        }

        const submission = await prisma.studentExtraData.update({
            where: { id: submissionId },
            data: {
                status,
                reviewedAt: status === 'PENDING' ? null : new Date(),
                rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Rejected by university') : null
            },
            include: { request: true, student: true }
        });

        await prisma.notification.create({
            data: {
                userId: submission.student.userId,
                type: status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'warning' : 'info',
                message: `Your submission for ${submission.request.fieldName} is ${status.toLowerCase()}.`
            }
        });

        res.json({ message: 'Submission status updated.', submission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update submission status.' });
    }
};

// [UNIVERSITY ONLY] Get all applications across all jobs
const getAllApplications = async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            include: {
                student: { include: { user: true } },
                job: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
};

// [UNIVERSITY ONLY] Get all partnered companies
const getCompanies = async (req, res) => {
    try {
        const companies = await prisma.company.findMany({
            include: {
                _count: {
                    select: { jobs: true }
                }
            }
        });
        res.status(200).json({ companies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch companies.' });
    }
};

// [UNIVERSITY ONLY] Get Academic Unit Tree
const getAcademicUnitTree = async (req, res) => {
    try {
        const units = await prisma.academicUnit.findMany({
            orderBy: { id: 'asc' }
        });

        const childrenByParent = new Map();
        units.forEach((unit) => {
            const key = unit.parentId || null;
            const children = childrenByParent.get(key) || [];
            children.push(unit);
            childrenByParent.set(key, children);
        });

        const students = await prisma.student.findMany({
            select: {
                id: true,
                academicUnitId: true,
                branch: true,
                placementStatus: true
            }
        });

        // Fetch jobs to count them properly (requires parsing targetBranches)
        const jobs = await prisma.job.findMany({
            where: { deadline: { gt: new Date() }, approvalStatus: 'APPROVED' },
            select: { id: true, targetBranches: true }
        });

        // Build Tree structure recursively
        const unitById = new Map(units.map((unit) => [unit.id, unit]));
        const studentsWithResolvedUnits = students.map((student) => ({
            ...student,
            resolvedAcademicUnitId: resolveStudentAcademicUnitId(student, unitById, childrenByParent)
        }));

        const buildTree = (parentId, level) => {
            const children = childrenByParent.get(parentId || null) || [];
            return children.map(unit => {
                const descendantUnitIds = collectDescendantUnitIds(unit.id, childrenByParent);
                const descendantUnitNames = units
                    .filter((candidate) => descendantUnitIds.includes(candidate.id))
                    .map((candidate) => candidate.name);
                const nodeStudents = studentsWithResolvedUnits.filter((student) => descendantUnitIds.includes(student.resolvedAcademicUnitId));
                const placed = nodeStudents.filter(s => s.placementStatus === 'PLACED').length;
                
                const jobCount = jobs.filter(j => {
                    const branches = Array.isArray(j.targetBranches) ? j.targetBranches : [];
                    return branches.length === 0 || branches.some((branch) => (
                        descendantUnitNames.some((unitName) => branchesMatch(branch, unitName))
                    ));
                }).length;

                return {
                    id: String(unit.id),
                    label: unit.name,
                    type: unit.type,
                    parentId: unit.parentId,
                    level,
                    students: nodeStudents.length,
                    placed,
                    jobs: jobCount,
                    filters: { academicUnitId: unit.id },
                    children: buildTree(unit.id, level + 1)
                };
            });
        };

        const tree = buildTree(null, 0);
        res.status(200).json({ tree });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch academic unit tree.' });
    }
};

const createAcademicUnit = async (req, res) => {
    try {
        const universityId = 1;
        const { name, type, parentId } = req.body;

        if (!name || !type) {
            return res.status(400).json({ error: 'Name and type are required.' });
        }

        if (parentId) {
            const parsedParentId = parseInt(parentId, 10);
            const parent = await prisma.academicUnit.findUnique({ where: { id: parsedParentId } });
            if (!parent || parent.universityId !== universityId) {
                return res.status(400).json({ error: 'Invalid parent academic unit.' });
            }

            const units = await prisma.academicUnit.findMany({
                where: { universityId },
                select: { id: true, parentId: true }
            });
            const childrenByParent = new Map();
            units.forEach((unit) => {
                const key = unit.parentId || null;
                const children = childrenByParent.get(key) || [];
                children.push(unit);
                childrenByParent.set(key, children);
            });

            const descendantIds = collectDescendantUnitIds(unitId, childrenByParent);
            if (descendantIds.includes(parsedParentId)) {
                return res.status(400).json({ error: 'An academic unit cannot be moved under its own child.' });
            }
        }

        const unit = await prisma.academicUnit.create({
            data: {
                name: name.trim(),
                type: type.trim(),
                parentId: parentId ? parseInt(parentId, 10) : null,
                universityId
            }
        });

        res.status(201).json({ message: 'Academic unit created.', unit });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create academic unit.' });
    }
};

const updateAcademicUnit = async (req, res) => {
    try {
        const universityId = 1;
        const unitId = parseInt(req.params.id, 10);
        const { name, type, parentId } = req.body;

        const existing = await prisma.academicUnit.findUnique({ where: { id: unitId } });
        if (!existing || existing.universityId !== universityId) {
            return res.status(404).json({ error: 'Academic unit not found.' });
        }

        if (parentId && parseInt(parentId, 10) === unitId) {
            return res.status(400).json({ error: 'An academic unit cannot be its own parent.' });
        }

        if (parentId) {
            const parent = await prisma.academicUnit.findUnique({ where: { id: parseInt(parentId, 10) } });
            if (!parent || parent.universityId !== universityId) {
                return res.status(400).json({ error: 'Invalid parent academic unit.' });
            }
        }

        const unit = await prisma.academicUnit.update({
            where: { id: unitId },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(type !== undefined && { type: type.trim() }),
                ...(parentId !== undefined && { parentId: parentId ? parseInt(parentId, 10) : null })
            }
        });

        res.json({ message: 'Academic unit updated.', unit });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update academic unit.' });
    }
};

const deleteAcademicUnit = async (req, res) => {
    try {
        const universityId = 1;
        const unitId = parseInt(req.params.id, 10);

        const existing = await prisma.academicUnit.findUnique({
            where: { id: unitId },
            include: { _count: { select: { children: true, students: true } } }
        });

        if (!existing || existing.universityId !== universityId) {
            return res.status(404).json({ error: 'Academic unit not found.' });
        }

        if (existing._count.children > 0 || existing._count.students > 0) {
            return res.status(400).json({ error: 'Cannot delete a unit with child units or students assigned.' });
        }

        await prisma.academicUnit.delete({ where: { id: unitId } });
        res.json({ message: 'Academic unit deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete academic unit.' });
    }
};

// [UNIVERSITY ONLY] Approve or Reject a job posting
const updateJobStatus = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);
        const { status, rejectionReason, universityDeadline } = req.body;

        const data = { approvalStatus: status };

        if (status === 'REJECTED') {
            data.rejectionReason = rejectionReason || 'Did not meet university criteria';
        }
        if (status === 'APPROVED' && universityDeadline) {
            data.universityDeadline = new Date(universityDeadline);
        }

        const job = await prisma.job.update({
            where: { id: jobId },
            data
        });
        res.status(200).json({ message: `Job ${status}`, job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update job status.' });
    }
};

// [UNIVERSITY ONLY] Get university profile and global filters
const getSettings = async (req, res) => {
    try {
        const universityId = 1; // Prototype single university
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            include: { filters: true }
        });
        
        if (!university) {
            return res.status(404).json({ error: 'University not found.' });
        }
        res.status(200).json({ university });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch settings.' });
    }
};

// [UNIVERSITY ONLY] Update university profile and global filters
const updateSettings = async (req, res) => {
    try {
        const universityId = 1; // Prototype single university
        const { name, minGlobalCgpa, maxGlobalBacklogs, allowedBranches } = req.body;

        const updatedUniversity = await prisma.university.update({
            where: { id: universityId },
            data: { name }
        });

        // Upsert filter
        const filter = await prisma.universityFilter.findFirst({ where: { universityId } });
        if (filter) {
            await prisma.universityFilter.update({
                where: { id: filter.id },
                data: { minGlobalCgpa, maxGlobalBacklogs, allowedBranches }
            });
        } else {
            await prisma.universityFilter.create({
                data: { universityId, minGlobalCgpa, maxGlobalBacklogs, allowedBranches }
            });
        }

        res.status(200).json({ message: 'Settings updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update settings.' });
    }
};

// [UNIVERSITY ONLY] Get all applications with PENDING_REVIEW status
const getPendingApplications = async (req, res) => {
    try {
        const applications = await prisma.application.findMany({
            where: { status: 'PENDING_REVIEW' },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        academicUnit: { select: { name: true } }
                    }
                },
                job: { include: { company: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ applications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending applications.' });
    }
};

// [UNIVERSITY ONLY] Approve a single application (forward to recruiter)
const approveApplication = async (req, res) => {
    try {
        const applicationId = parseInt(req.params.id, 10);
        const application = await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'FORWARDED_TO_RECRUITER', universityRemarks: null }
        });

        // Notify student
        const fullApp = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { student: true, job: { select: { title: true } } }
        });
        if (fullApp) {
            await prisma.notification.create({
                data: {
                    userId: fullApp.student.userId,
                    type: 'success',
                    message: `Your application for "${fullApp.job.title}" has been forwarded to the recruiter.`
                }
            });
        }

        res.status(200).json({ message: 'Application forwarded to recruiter.', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve application.' });
    }
};

// [UNIVERSITY ONLY] Reject a single application with reason
const rejectApplication = async (req, res) => {
    try {
        const applicationId = parseInt(req.params.id, 10);
        const { reason } = req.body;

        const application = await prisma.application.update({
            where: { id: applicationId },
            data: {
                status: 'REJECTED_BY_UNIVERSITY',
                universityRemarks: reason || 'Rejected by university'
            }
        });

        // Notify student
        const fullApp = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { student: true, job: { select: { title: true } } }
        });
        if (fullApp) {
            await prisma.notification.create({
                data: {
                    userId: fullApp.student.userId,
                    type: 'warning',
                    message: `Your application for "${fullApp.job.title}" was rejected by the university. Reason: ${reason || 'Not specified'}`
                }
            });
        }

        res.status(200).json({ message: 'Application rejected.', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reject application.' });
    }
};

// [UNIVERSITY ONLY] Mass-forward all pending applications for a specific job
const massForwardApplications = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);

        const result = await prisma.application.updateMany({
            where: { jobId, status: 'PENDING_REVIEW' },
            data: { status: 'FORWARDED_TO_RECRUITER' }
        });

        // Notify all affected students
        const forwardedApps = await prisma.application.findMany({
            where: { jobId, status: 'FORWARDED_TO_RECRUITER' },
            include: { student: true, job: { select: { title: true } } }
        });
        if (forwardedApps.length > 0) {
            await prisma.notification.createMany({
                data: forwardedApps.map(app => ({
                    userId: app.student.userId,
                    type: 'success',
                    message: `Your application for "${app.job.title}" has been forwarded to the recruiter.`
                }))
            });
        }

        res.status(200).json({
            message: `${result.count} application(s) forwarded to recruiter.`,
            count: result.count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mass-forward applications.' });
    }
};

// [UNIVERSITY ONLY] List all student certifications for review
const getCertifications = async (req, res) => {
    try {
        const certifications = await prisma.certification.findMany({
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        academicUnit: { select: { name: true } }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        const mapped = certifications.map(c => ({
            id: c.id, name: c.name, platform: c.platform,
            issueDate: c.issueDate, credentialUrl: c.credentialUrl,
            verified: c.verified,
            studentName: c.student.user.name,
            studentEmail: c.student.user.email,
            studentBranch: c.student.academicUnit?.name || 'N/A'
        }));
        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch certifications.' });
    }
};


// [UNIVERSITY ONLY] Verify or reject a certification
const verifyCertification = async (req, res) => {
    try {
        const certId = parseInt(req.params.id, 10);
        const { verified } = req.body;
        const cert = await prisma.certification.update({
            where: { id: certId },
            data: { verified: !!verified }
        });
        res.json({ message: verified ? 'Certification verified' : 'Certification rejected', cert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update certification.' });
    }
};

module.exports = { 
    approveStudent,
    rejectStudent,
    getStudents, 
    getDashboardStats,
    createDataRequest,
    getDataRequests,
    deleteDataRequest,
    getStudentExtraData,
    submitExtraData,
    getExtraDataSubmissions,
    updateExtraDataSubmissionStatus,
    getAllApplications,
    getCompanies,
    getAcademicUnitTree,
    createAcademicUnit,
    updateAcademicUnit,
    deleteAcademicUnit,
    getPendingJobs,
    updateJobStatus,
    getSettings,
    updateSettings,
    getCertifications,
    verifyCertification,
    getPendingApplications,
    approveApplication,
    rejectApplication,
    massForwardApplications
};
