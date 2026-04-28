const prisma = require('../utils/prisma');
const { evaluateEligibility } = require('../services/engine/eligibilityEngine');

// [ALL ROLES] View open jobs. If requested by a student, append eligibility info.
const getJobs = async (req, res) => {
    try {
        // Students only see approved jobs
        const whereClause = {};
        if (req.user && req.user.role === 'STUDENT') {
            whereClause.approvalStatus = 'APPROVED';
        }

        const jobs = await prisma.job.findMany({
            where: whereClause,
            include: { company: true },
            orderBy: { deadline: 'asc' }
        });

        // If a student is requesting, attach eligibility flags
        if (req.user && req.user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({
                where: { userId: req.user.id },
                include: { academicUnit: true }
            });

            if (student) {
                // Fetch university filter if it exists
                const uniFilter = await prisma.universityFilter.findFirst({
                    where: { universityId: student.universityId }
                });

                const enhancedJobs = [];
                for (const job of jobs) {
                    const eligibility = await evaluateEligibility(student, job, uniFilter);
                    enhancedJobs.push({
                        ...job,
                        // Show university deadline to students if set (earlier cutoff)
                        deadline: job.universityDeadline || job.deadline,
                        eligibilityStatus: eligibility.isEligible,
                        matchScore: eligibility.matchScore,
                        feedback: eligibility.feedback
                    });
                }
                return res.status(200).json(enhancedJobs);
            }
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
};

// [STUDENT ONLY] Apply for a job
const applyForJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);
        const userId = req.user.id; 

        const student = await prisma.student.findUnique({
            where: { userId },
            include: { academicUnit: true }
        });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ error: 'Job not found.' });

        // Check university deadline first, then recruiter deadline
        const effectiveDeadline = job.universityDeadline || job.deadline;
        if (new Date() > effectiveDeadline) {
            return res.status(400).json({ error: 'Application deadline has passed.' });
        }

        if (student.placementStatus === 'PLACED') {
            return res.status(400).json({ error: 'You are already placed.' });
        }

        const existingApp = await prisma.application.findFirst({
            where: { jobId, studentId: student.id }
        });
        if (existingApp) {
            return res.status(400).json({ error: 'You have already applied.' });
        }

        // Run full eligibility evaluation (branch, year, backlogs, cgpa, university filters)
        const uniFilter = await prisma.universityFilter.findFirst({
            where: { universityId: student.universityId }
        });

        const eligibility = await evaluateEligibility(student, job, uniFilter);

        if (!eligibility.isEligible) {
            return res.status(400).json({ 
                error: 'Not eligible for this job.', 
                reasons: eligibility.feedback 
            });
        }

        // Save application with PENDING_REVIEW status (held at university level)
        const application = await prisma.application.create({
            data: {
                jobId,
                studentId: student.id,
                matchScore: eligibility.matchScore, 
                status: 'PENDING_REVIEW'
            }
        });

        res.status(201).json({ message: 'Application submitted', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to apply.' });
    }
};

module.exports = { getJobs, applyForJob };
