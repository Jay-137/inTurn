const prisma = require('../utils/prisma');

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

module.exports = { getUniversityStats, getJobApplicants };