const prisma = require('../utils/prisma');

// Fetch the profile of the current company
const getCompanyProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });

        if (!user || !user.company) {
            return res.status(404).json({ error: "Company profile not found" });
        }

        res.json({ company: user.company });
    } catch (error) {
        res.status(500).json({ error: "Server error fetching company profile" });
    }
};

// Post a new job with eligibility criteria and skill vectors
const postJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            deadline,
            minCgpa,
            maxBacklogs,
            targetBranches, // Array of strings e.g. ["CSE", "IT"]
            targetYears,    // Array of numbers e.g. [2024, 2025]
            skills,         // Array of objects: { skillName: "React", priority: "HIGH" }
            location,
            salary,
            type,
            tags
        } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });

        if (!user || !user.company) {
            return res.status(403).json({ error: "Only registered company recruiters can post jobs" });
        }

        // Create the Job
        const newJob = await prisma.job.create({
            data: {
                title,
                deadline: new Date(deadline),
                minCgpa: minCgpa || 0,
                maxBacklogs: maxBacklogs || 0,
                targetBranches: targetBranches || [],
                targetYears: targetYears || [],
                companyId: user.company.id,
                location,
                salary,
                type,
                tags: tags || []
            }
        });

        // Resolve skills and create JobSkill vectors
        if (skills && Array.isArray(skills)) {
            const validPriorities = ['HIGH', 'MEDIUM', 'LOW', 'GOOD_TO_HAVE'];
            
            for (const s of skills) {
                // Ensure priority is valid
                const priority = validPriorities.includes(s.priority.toUpperCase()) 
                    ? s.priority.toUpperCase() 
                    : 'MEDIUM';

                // Find or create the skill in the master database
                // (Assuming you have a way to standardize names, but for now we upsert by name)
                let skillRecord = await prisma.skill.findFirst({
                    where: { name: s.skillName }
                });

                if (!skillRecord) {
                    skillRecord = await prisma.skill.create({
                        data: { name: s.skillName, type: "General" }
                    });
                }

                await prisma.jobSkill.create({
                    data: {
                        jobId: newJob.id,
                        skillId: skillRecord.id,
                        priority: priority
                    }
                });
            }
        }

        res.status(201).json({ message: "Job posted successfully", job: newJob });
    } catch (error) {
        console.error("Error posting job:", error);
        res.status(500).json({ error: "Failed to post job" });
    }
};

// View applicants for a specific job, sorted by Match Score
const getJobApplicants = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);

        const applications = await prisma.application.findMany({
            where: { jobId },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        externalProfiles: true,
                        skills: { include: { skill: true } }, softSkills: true, certifications: true, experiences: true
                    }
                }
            },
            orderBy: {
                matchScore: 'desc' // Sort highest match score first
            }
        });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch applicants" });
    }
};

// Analytics: Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });

        if (!user || !user.company) {
            return res.status(403).json({ error: "Only registered company recruiters can view stats" });
        }

        const companyId = user.company.id;

        // Active Job Postings
        const activeJobsCount = await prisma.job.count({
            where: { companyId, deadline: { gt: new Date() } }
        });

        // All Jobs by this company
        const companyJobs = await prisma.job.findMany({
            where: { companyId },
            select: { id: true, title: true, deadline: true }
        });
        const jobIds = companyJobs.map(j => j.id);

        // All Applications to these jobs
        const applications = await prisma.application.findMany({
            where: { jobId: { in: jobIds } },
            include: { student: { include: { user: true, softSkills: true, certifications: true, experiences: true, skills: { include: { skill: true } } } }, job: { select: { title: true } } }
        });

        const totalApplicants = applications.length;
        const shortlistedCount = applications.filter(a => a.matchScore !== null && a.matchScore >= 75).length;
        const pendingCount = applications.filter(a => a.status === 'APPLIED').length;
        const rejectedCount = applications.filter(a => a.status === 'REJECTED_ELIGIBILITY').length;

        // Calculate Average Match Score
        const appsWithScore = applications.filter(a => a.matchScore !== null);
        const avgMatchScore = appsWithScore.length > 0 
            ? Math.round(appsWithScore.reduce((sum, a) => sum + a.matchScore, 0) / appsWithScore.length)
            : 0;

        // Weekly Trend Aggregation (last 7 days)
        const weeklyTrend = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            
            const appsOnDay = applications.filter(a => {
                const appDate = new Date(a.createdAt).toISOString().split('T')[0];
                return appDate === dateString;
            });

            // e.g. "Mon", "Tue"
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            weeklyTrend.push({ label: dayName, apps: appsOnDay.length, date: dateString });
        }

        // Active Jobs Detailed
        const activeJobsDetailed = companyJobs
            .filter(j => new Date(j.deadline) > new Date())
            .map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                return {
                    title: job.title,
                    posted: `Deadline: ${new Date(job.deadline).toLocaleDateString()}`,
                    status: "Active",
                    applicants: jobApps.length,
                    shortlisted: jobApps.filter(a => a.matchScore !== null && a.matchScore >= 75).length,
                    pending: jobApps.filter(a => a.status === 'APPLIED').length,
                    rejected: jobApps.filter(a => a.status === 'REJECTED_ELIGIBILITY').length
                };
            });

        // Recent Applicants
        const recentApplicants = applications
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4)
            .map(a => ({
                name: a.student.user.name,
                role: a.job.title,
                time: new Date(a.createdAt).toLocaleDateString(),
                score: Math.round(a.matchScore || 0),
                color: "bg-blue-500" // Can be randomized or derived in frontend
            }));

        res.json({
            summaryCards: [
                { label: "Active Job Postings", value: activeJobsCount.toString(), sub: "All positions open", color: "blue" },
                { label: "Total Applicants", value: totalApplicants.toString(), sub: "All time", color: "indigo" },
                { label: "Shortlisted", value: shortlistedCount.toString(), sub: "Match >= 75%", color: "green" },
                { label: "Avg Match Score", value: `${avgMatchScore}%`, sub: "Across all apps", color: "amber" }
            ],
            activeJobs: activeJobsDetailed,
            applicationStatus: [
                { name: "Shortlisted", value: shortlistedCount, color: "#22c55e" },
                { name: "Pending", value: pendingCount, color: "#6366f1" },
                { name: "Rejected", value: rejectedCount, color: "#ef4444" }
            ],
            weeklyTrend,
            recentApplicants
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};

// Analytics: Get Strictly Shortlisted Candidates
const getShortlistedCandidates = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });

        if (!user || !user.company) {
            return res.status(403).json({ error: "Only registered company recruiters can view this" });
        }

        const companyId = user.company.id;

        const companyJobs = await prisma.job.findMany({
            where: { companyId },
            select: { id: true }
        });
        const jobIds = companyJobs.map(j => j.id);

        const applications = await prisma.application.findMany({
            where: { 
                jobId: { in: jobIds },
                matchScore: { gte: 75 } // Shortlisted threshold
            },
            include: {
                student: { include: { user: true, softSkills: true, certifications: true, experiences: true, skills: { include: { skill: true } } } },
                job: true
            },
            orderBy: { matchScore: 'desc' }
        });

        const candidates = applications.map(a => ({
            name: a.student.user.name,
            role: a.job.title,
            branch: a.student.branch || "N/A",
            score: Math.round(a.matchScore),
            status: a.status === 'APPLIED' ? 'Shortlisted' : a.status,
            videoResumeUrl: a.student.videoResumeUrl
        }));

        res.json({ candidates });
    } catch (error) {
        console.error("Shortlisted error:", error);
        res.status(500).json({ error: "Failed to fetch shortlisted candidates" });
    }
};

module.exports = {
    getCompanyProfile,
    postJob,
    getJobApplicants,
    getDashboardStats,
    getShortlistedCandidates
};
