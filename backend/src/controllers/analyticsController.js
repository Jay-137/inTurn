const prisma = require('../utils/prisma');

const PLACEMENT_BRANCH_UNIT_TYPES = new Set(['DEPARTMENT', 'STREAM', 'BRANCH', 'PROGRAM', 'PROGRAMME', 'COURSE']);

/**
 * Traverses up the academic unit tree to find the parent branch/department name.
 */
const getPlacementBranch = (student) => {
    if (student.branch) return student.branch;
    
    let current = student.academicUnit;
    let fallback = student.academicUnit?.name || 'Unassigned';

    while (current) {
        const type = String(current.type || '').toUpperCase();
        if (PLACEMENT_BRANCH_UNIT_TYPES.has(type)) {
            return current.name;
        }
        current = current.parent;
    }

    return fallback;
};

const buildBranchStats = (students) => {
    const stats = new Map();

    students.forEach((student) => {
        const branch = getPlacementBranch(student);
        const current = stats.get(branch) || { branch, total: 0, placed: 0, rate: 0 };
        current.total += 1;
        if (student.placementStatus === 'PLACED') current.placed += 1;
        stats.set(branch, current);
    });

    return Array.from(stats.values())
        .map((entry) => ({
            ...entry,
            rate: entry.total > 0 ? Math.round((entry.placed / entry.total) * 100) : 0
        }))
        .sort((a, b) => a.branch.localeCompare(b.branch));
};

// [UNIVERSITY ONLY] Get high-level placement stats
const getUniversityStats = async (req, res) => {
    try {
        const totalStudents = await prisma.student.count();
        const placedStudents = await prisma.student.count({
            where: { placementStatus: 'PLACED' }
        });
        
        const unplacedStudents = totalStudents - placedStudents;
        const placementRate = totalStudents === 0 ? 0 : ((placedStudents / totalStudents) * 100).toFixed(1);

        res.status(200).json({
            totalStudents,
            placedStudents,
            unplacedStudents,
            placementRate: `${placementRate}%`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch university analytics.' });
    }
};

// [RECRUITER ONLY] View applicants for a specific job, ranked by Match Score
const getJobApplicants = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);

        // Fetch applications, order by best match first
        const applications = await prisma.application.findMany({
            where: { jobId },
            orderBy: { matchScore: 'desc' }, 
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        skills: { include: { skill: { select: { name: true } } } }
                    }
                }
            }
        });

        res.status(200).json({
            jobId,
            totalApplicants: applications.length,
            applicants: applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch applicants.' });
    }
};

// [UNIVERSITY ONLY] Student Analytics
const getStudentAnalytics = async (req, res) => {
    try {
        const totalStudents = await prisma.student.count();
        const placedStudents = await prisma.student.count({ where: { placementStatus: 'PLACED' } });
        const unplacedStudents = totalStudents - placedStudents;
        const placementRate = totalStudents === 0 ? 0 : Math.round((placedStudents / totalStudents) * 100);

        const students = await prisma.student.findMany({
            select: {
                branch: true,
                placementStatus: true,
                academicUnit: {
                    select: {
                        name: true,
                        type: true,
                        parent: {
                            select: {
                                name: true,
                                type: true,
                                parent: {
                                    select: {
                                        name: true,
                                        type: true,
                                        parent: {
                                            select: { name: true, type: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const branchStats = buildBranchStats(students);

        res.status(200).json({
            totalStudents, placedStudents, unplacedStudents, placementRate, branchStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student analytics.' });
    }
};

// [UNIVERSITY ONLY] Recruiter Analytics
const getRecruiterAnalytics = async (req, res) => {
    try {
        const totalCompanies = await prisma.company.count();
        const totalJobs = await prisma.job.count();
        const totalApplications = await prisma.application.count();
        
        const topHiringCompanies = await prisma.company.findMany({
            include: {
                _count: { select: { jobs: true } }
            },
            take: 5
        });

        const activeJobs = await prisma.job.count({
            where: { deadline: { gt: new Date() } }
        });

        res.status(200).json({
            totalCompanies, totalJobs, totalApplications, activeJobs,
            topCompanies: topHiringCompanies.map(c => ({ name: c.name, jobsPosted: c._count.jobs }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recruiter analytics.' });
    }
};

module.exports = { getUniversityStats, getJobApplicants, getStudentAnalytics, getRecruiterAnalytics };
