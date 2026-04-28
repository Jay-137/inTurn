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

// View applicants for a specific job — only those forwarded by university
const getJobApplicants = async (req, res) => {
    try {
        const jobId = parseInt(req.params.jobId);

        const applications = await prisma.application.findMany({
            where: {
                jobId,
                status: { notIn: ['PENDING_REVIEW', 'REJECTED_BY_UNIVERSITY'] }
            },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        academicUnit: { select: { name: true, type: true } },
                        externalProfiles: true,
                        skills: { include: { skill: true } },
                        softSkills: true,
                        certifications: true,
                        experiences: true
                    }
                }
            },
            orderBy: {
                matchScore: 'desc'
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
            select: { id: true, title: true, deadline: true, approvalStatus: true, rejectionReason: true }
        });
        const jobIds = companyJobs.map(j => j.id);

        // All Applications to these jobs (only forwarded ones visible to recruiter)
        const applications = await prisma.application.findMany({
            where: {
                jobId: { in: jobIds },
                status: { notIn: ['PENDING_REVIEW', 'REJECTED_BY_UNIVERSITY'] }
            },
            include: { student: { include: { user: true, softSkills: true, certifications: true, experiences: true, skills: { include: { skill: true } } } }, job: { select: { title: true } } }
        });

        const totalApplicants = applications.length;
        const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED_BY_RECRUITER').length;
        const pendingCount = applications.filter(a => a.status === 'FORWARDED_TO_RECRUITER').length;
        const rejectedCount = applications.filter(a => a.status === 'REJECTED_BY_RECRUITER').length;

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

        // Jobs Detailed (shows all jobs, including pending/rejected ones)
        const activeJobsDetailed = companyJobs
            .map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                // Status derivation
                let displayStatus = job.approvalStatus;
                if (displayStatus === 'APPROVED' && new Date(job.deadline) < new Date()) {
                    displayStatus = 'EXPIRED';
                }

                return {
                    id: job.id,
                    title: job.title,
                    posted: `Deadline: ${new Date(job.deadline).toLocaleDateString()}`,
                    status: displayStatus,
                    approvalStatus: job.approvalStatus,
                    rejectionReason: job.rejectionReason,
                    applicants: jobApps.length,
                    shortlisted: jobApps.filter(a => a.status === 'SHORTLISTED_BY_RECRUITER').length,
                    pending: jobApps.filter(a => a.status === 'FORWARDED_TO_RECRUITER').length,
                    rejected: jobApps.filter(a => a.status === 'REJECTED_BY_RECRUITER').length
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
                status: 'SHORTLISTED_BY_RECRUITER'
            },
            include: {
                student: { include: { user: true, academicUnit: { select: { name: true } }, softSkills: true, certifications: true, experiences: true, skills: { include: { skill: true } } } },
                job: true
            },
            orderBy: { matchScore: 'desc' }
        });

        const candidates = applications.map(a => ({
            id: a.id,
            name: a.student.user.name,
            email: a.student.user.email,
            role: a.job.title,
            jobId: a.job.id,
            branch: a.student.academicUnit?.name || a.student.branch || "N/A",
            score: Math.round(a.matchScore || 0),
            status: 'Shortlisted',
            resumeUrl: a.student.resumeUrl,
            videoResumeUrl: a.student.videoResumeUrl,
            skills: a.student.skills.map(s => ({ name: s.skill.name, score: s.score }))
        }));

        res.json({ candidates });
    } catch (error) {
        console.error("Shortlisted error:", error);
        res.status(500).json({ error: "Failed to fetch shortlisted candidates" });
    }
};

// Recruiter action: Shortlist or Reject an applicant
const updateApplicantStatus = async (req, res) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { status } = req.body; // 'SHORTLISTED_BY_RECRUITER' or 'REJECTED_BY_RECRUITER'

        const validStatuses = ['SHORTLISTED_BY_RECRUITER', 'REJECTED_BY_RECRUITER'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Verify this application belongs to a job owned by this recruiter
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });
        if (!user || !user.company) {
            return res.status(403).json({ error: "Only registered company recruiters can perform this action" });
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }
        if (application.job.companyId !== user.company.id) {
            return res.status(403).json({ error: "This application does not belong to your company" });
        }

        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        res.json({ message: `Application ${status === 'SHORTLISTED_BY_RECRUITER' ? 'shortlisted' : 'rejected'}`, application: updated });
    } catch (error) {
        console.error("Update applicant status error:", error);
        res.status(500).json({ error: "Failed to update applicant status" });
    }
};

module.exports = {
    getCompanyProfile,
    postJob,
    getJobApplicants,
    getDashboardStats,
    getShortlistedCandidates,
    updateApplicantStatus
};
