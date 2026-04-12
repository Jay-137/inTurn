const prisma = require('../utils/prisma');
const { calculateMatchScore } = require('../utils/matchScorer');
// [RECRUITER ONLY] Post a new job
const createJob = async (req, res) => {
    try {
        const { title, minCgpa, maxBacklogs, deadline } = req.body;

        const job = await prisma.job.create({
            data: {
                title,
                minCgpa,
                maxBacklogs,
                // Ensure deadline is parsed as an ISO-8601 Date object
                deadline: new Date(deadline) 
            }
        });

        res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create job.' });
    }
};

// [ALL ROLES] View open jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { deadline: 'asc' }
        });
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch jobs.' });
    }
};

// [STUDENT ONLY] Apply for a job (With Hard Filter)
const applyForJob = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId, 10);
        const userId = req.user.id; // From JWT

        // 1. Fetch the actual student profile using the JWT userId
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
        }

        // 2. Fetch the job requirements
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) return res.status(404).json({ error: 'Job not found.' });

        // === THE HARD FILTER ===

        // A. Deadline Check
        if (new Date() > job.deadline) {
            return res.status(400).json({ error: 'Application rejected: The deadline for this job has passed.' });
        }

        // B. CGPA Check
        if (student.cgpa < job.minCgpa) {
            return res.status(400).json({ 
                error: `Eligibility failed: Your CGPA (${student.cgpa}) is below the required minimum (${job.minCgpa}).` 
            });
        }

        // C. Backlog Check
        if (student.backlogCount > job.maxBacklogs) {
            return res.status(400).json({ 
                error: `Eligibility failed: Your active backlogs (${student.backlogCount}) exceed the maximum allowed (${job.maxBacklogs}).` 
            });
        }

        // D. Placement Policy Check (Students already placed cannot apply)
        if (student.placementStatus === 'PLACED') {
            return res.status(400).json({ error: 'Policy violation: You are already placed and cannot apply for further jobs.' });
        }

        // E. Duplicate Application Check
        const existingApp = await prisma.application.findFirst({
            where: { jobId, studentId: student.id }
        });
        if (existingApp) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        // === END HARD FILTER ===

        // 3. Save the valid application
      // NEW: Calculate the dynamic Match Score just before saving
        const calculatedScore = await calculateMatchScore(student.id, jobId);

        // 3. Save the valid application
        const application = await prisma.application.create({
            data: {
                jobId,
                studentId: student.id,
                matchScore: calculatedScore, // <-- Inject the score here
                status: 'APPLIED'
            }
        });

        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
};

module.exports = { createJob, getJobs, applyForJob };