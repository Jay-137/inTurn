const prisma = require('../utils/prisma');
const leetcodeService = require('../services/integrations/leetcode.service');
const codeforcesService = require('../services/integrations/codeforces.service');
const githubService = require('../services/integrations/github.service');
const { generateSkillVector } = require('../services/engine/skillVectorGenerator');

const PLACEMENT_BRANCH_UNIT_TYPES = new Set(['DEPARTMENT', 'STREAM', 'BRANCH', 'PROGRAM', 'PROGRAMME', 'COURSE']);

const academicUnitParentInclude = {
    parent: {
        include: {
            parent: {
                include: {
                    parent: {
                        include: { parent: true }
                    }
                }
            }
        }
    }
};

function getPlacementBranchFromUnit(unit) {
    let current = unit;
    let fallback = unit;

    while (current) {
        const type = String(current.type || '').toUpperCase();
        if (PLACEMENT_BRANCH_UNIT_TYPES.has(type)) {
            return current.name;
        }
        if (!['SECTION', 'SCHOOL', 'INSTITUTE', 'FIELD'].includes(type)) {
            fallback = current;
        }
        current = current.parent;
    }

    return fallback?.name || unit?.name || null;
}

async function validateSelectableAcademicUnit(academicUnitId, universityId) {
    const parsedAcademicUnitId = parseInt(academicUnitId, 10);
    const parsedUniversityId = parseInt(universityId, 10);

    if (!parsedAcademicUnitId || !parsedUniversityId) {
        return { error: 'University and academic unit are required.' };
    }

    const academicUnit = await prisma.academicUnit.findUnique({
        where: { id: parsedAcademicUnitId },
        include: academicUnitParentInclude
    });

    if (!academicUnit) {
        return { error: 'Invalid academic unit selected.' };
    }

    if (academicUnit.universityId !== parsedUniversityId) {
        return { error: 'Selected academic unit does not belong to this university.' };
    }

    const childCount = await prisma.academicUnit.count({
        where: { parentId: parsedAcademicUnitId }
    });

    if (childCount > 0) {
        return { error: 'Please select the most specific academic unit available.' };
    }

    return {
        academicUnit,
        placementBranch: getPlacementBranchFromUnit(academicUnit)
    };
}

const createProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { universityId, academicUnitId, cgpa, backlogCount, passingYear } = req.body;

        const existingProfile = await prisma.student.findUnique({ where: { userId } });
        if (existingProfile) return res.status(400).json({ error: 'Student profile already exists.' });

        const unitSelection = await validateSelectableAcademicUnit(academicUnitId, universityId);
        if (unitSelection.error) {
            return res.status(400).json({ error: unitSelection.error });
        }

        const { academicUnit, placementBranch } = unitSelection;

        const student = await prisma.student.create({
            data: {
                userId,
                universityId: academicUnit.universityId,
                academicUnitId: academicUnit.id,
                cgpa,
                backlogCount,
                passingYear,
                branch: placementBranch,
                registrationStatus: 'PENDING', 
                placementStatus: 'UNPLACED'
            }
        });

        res.status(201).json({ message: 'Profile created successfully', student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create student profile.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { videoResumeUrl, resumeUrl, cgpa, backlogCount, passingYear, academicUnitId } = req.body;

        const currentStudent = await prisma.student.findUnique({ where: { userId } });
        if (!currentStudent) return res.status(404).json({ error: 'Student profile not found.' });

        const academicDetailsChanged = (
            cgpa !== undefined ||
            backlogCount !== undefined ||
            passingYear !== undefined ||
            academicUnitId !== undefined
        );

        const data = {
            ...(videoResumeUrl !== undefined && { videoResumeUrl }),
            ...(resumeUrl !== undefined && { resumeUrl }),
            ...(cgpa !== undefined && { cgpa }),
            ...(backlogCount !== undefined && { backlogCount }),
            ...(passingYear !== undefined && { passingYear }),
            ...(academicDetailsChanged && { registrationStatus: 'PENDING', rejectionReason: null })
        };

        if (academicUnitId !== undefined) {
            const unitSelection = await validateSelectableAcademicUnit(academicUnitId, currentStudent.universityId);
            if (unitSelection.error) {
                return res.status(400).json({ error: unitSelection.error });
            }

            data.academicUnitId = unitSelection.academicUnit.id;
            data.branch = unitSelection.placementBranch;
        }

        const student = await prisma.student.update({
            where: { userId },
            data
        });

        res.json({ message: "Profile updated", student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.userId, 10);

        const student = await prisma.student.findUnique({
            where: { userId: requestedUserId },
            include: {
                user: { select: { name: true, email: true } },
                university: { select: { name: true } },
                academicUnit: { select: { name: true, type: true } },
                coreSubjects: true,
                skills: { include: { skill: true } },
                externalProfiles: true,
                experiences: true,
                certifications: true,
                softSkills: true,
                extraData: { include: { request: true } },
                applications: true
            }
        });

        if (!student) return res.status(404).json({ error: 'Student profile not found.' });

        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student profile.' });
    }
};

// 1. Generate token for a platform
const requestPlatformVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { platform, handle } = req.body;
        
        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        let token = '';
        if (platform === 'leetcode') token = leetcodeService.generateVerificationToken(student.id);
        else if (platform === 'codeforces') token = codeforcesService.generateVerificationToken(student.id);
        else if (platform === 'github') token = githubService.generateVerificationToken(student.id);
        else return res.status(400).json({ error: 'Invalid platform' });

        // Save unverified profile
        const profile = await prisma.externalProfile.create({
            data: {
                studentId: student.id,
                platform,
                url: handle, // We store the handle in url for now
                verificationToken: token,
                isVerified: false
            }
        });

        // Immediately fetch stats so the user can see their data before verification
        let stats = null;
        try {
            if (platform === 'leetcode') {
                const rawData = await leetcodeService.fetchLeetcodeProfile(handle);
                stats = leetcodeService.parseStats(rawData);
            } else if (platform === 'codeforces') {
                const cfProfile = await codeforcesService.fetchCodeforcesProfile(handle);
                const cfSubs = await codeforcesService.fetchUserSubmissions(handle);
                stats = codeforcesService.parseStats(cfProfile, cfSubs);
            } else if (platform === 'github') {
                const ghProfile = await githubService.fetchGithubProfile(handle);
                const ghRepos = await githubService.fetchGithubRepos(handle);
                stats = await githubService.parseStatsWithRepoSignals(ghProfile, ghRepos);
            }
            if (stats) {
                await prisma.externalProfile.update({
                    where: { id: profile.id },
                    data: { stats }
                });
            }
        } catch (statsFetchErr) {
            console.error(`[Platform] Stats pre-fetch failed for ${platform}:`, statsFetchErr.message);
        }

        res.json({ message: `Please place the token '${token}' in your ${platform} bio/location`, token, profileId: profile.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate verification request.' });
    }
};

// 2. Verify platform ownership
const verifyPlatform = async (req, res) => {
    try {
        const { profileId } = req.body;
        
        const profile = await prisma.externalProfile.findUnique({ where: { id: profileId } });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        let isVerified = false;
        let stats = null;

        if (profile.platform === 'leetcode') {
            isVerified = await leetcodeService.verifyOwnership(profile.url, profile.verificationToken);
            if (isVerified) {
                const rawData = await leetcodeService.fetchLeetcodeProfile(profile.url);
                stats = leetcodeService.parseStats(rawData);
            }
        } else if (profile.platform === 'codeforces') {
            isVerified = await codeforcesService.verifyOwnership(profile.url, profile.verificationToken);
            if (isVerified) {
                const cfProfile = await codeforcesService.fetchCodeforcesProfile(profile.url);
                const cfSubs = await codeforcesService.fetchUserSubmissions(profile.url);
                stats = codeforcesService.parseStats(cfProfile, cfSubs);
            }
        } else if (profile.platform === 'github') {
            isVerified = await githubService.verifyOwnership(profile.url, profile.verificationToken);
            if (isVerified) {
                const ghProfile = await githubService.fetchGithubProfile(profile.url);
                const ghRepos = await githubService.fetchGithubRepos(profile.url);
                stats = await githubService.parseStatsWithRepoSignals(ghProfile, ghRepos);
            }
        }

        if (!isVerified) {
            return res.status(400).json({ error: 'Verification failed. Token not found in profile.' });
        }

        const updatedProfile = await prisma.externalProfile.update({
            where: { id: profileId },
            data: { isVerified: true, verificationToken: null, stats: stats }
        });

        res.json({ message: "Verification successful", profile: updatedProfile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to verify profile.' });
    }
};
 
const removePlatform = async (req, res) => {
    try {
        const userId = req.user.id;
        const { platform } = req.params;

        const student = await prisma.student.findUnique({ where: { userId } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        await prisma.externalProfile.deleteMany({
            where: {
                studentId: student.id,
                platform: platform.toLowerCase()
            }
        });

        // Trigger skill regeneration after removal
        const skillMap = generateSkillVector([]); // Get empty or current remaining profiles
        // We'll just call the internal logic to keep it simple or the user can re-generate
        
        res.json({ message: `Disconnected from ${platform}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to disconnect platform' });
    }
};

// 3. Trigger Skill Vector Generation manually or after verification
const generateSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const student = await prisma.student.findUnique({ 
            where: { userId },
            include: { 
                externalProfiles: true,
                university: true,
                academicUnit: true,
                experiences: true,
                certifications: true,
                coreSubjects: true
            }
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const skillMap = generateSkillVector(student);

        // Delete old skills
        await prisma.studentSkill.deleteMany({ where: { studentId: student.id } });

        // Save new skills
        const savedSkills = [];
        for (const [skillName, score] of Object.entries(skillMap)) {
            // Find or create skill generic
            let skillRecord = await prisma.skill.findFirst({ where: { name: skillName } });
            if (!skillRecord) {
                skillRecord = await prisma.skill.create({ data: { name: skillName, type: 'Generated' } });
            }

            const ss = await prisma.studentSkill.create({
                data: {
                    studentId: student.id,
                    skillId: skillRecord.id,
                    score: score
                }
            });
            savedSkills.push(ss);
        }

        res.json({ message: "Skills generated successfully", skills: skillMap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate skills.' });
    }
};

// --- New Feature Endpoints ---

const addExperience = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const { title, company, type, duration, description, skills } = req.body;
        const experience = await prisma.experience.create({
            data: { studentId: student.id, title, company, type, duration, description, skills }
        });
        res.json({ message: "Experience added", experience });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add experience' });
    }
};

const removeExperience = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.experience.delete({ where: { id } });
        res.json({ message: "Experience removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove experience' });
    }
};

const addCertification = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const { name, platform, issueDate, credentialUrl } = req.body;
        const cert = await prisma.certification.create({
            data: { studentId: student.id, name, platform, issueDate, credentialUrl }
        });
        res.json({ message: "Certification added", cert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add certification' });
    }
};

const removeCertification = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.certification.delete({ where: { id } });
        res.json({ message: "Certification removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to remove certification' });
    }
};

const updateSoftSkills = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const { skills } = req.body; // array of strings
        
        await prisma.softSkill.deleteMany({ where: { studentId: student.id } });
        
        if (skills && skills.length > 0) {
            await prisma.softSkill.createMany({
                data: skills.map(name => ({ studentId: student.id, name }))
            });
        }
        res.json({ message: "Soft skills updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update soft skills' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to mark notification' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const shortlistedStatuses = ['SHORTLISTED', 'ACCEPTED_BY_RECRUITER', 'SELECTED_BY_RECRUITER'];
        const shortlistedApplications = await prisma.application.findMany({
            where: {
                studentId: student.id,
                status: { in: shortlistedStatuses }
            },
            include: { job: { include: { company: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const totalApplications = await prisma.application.count({
            where: { studentId: student.id }
        });

        res.json({
            shortlistedCount: shortlistedApplications.length,
            totalApplications,
            shortlistedApplications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.notification.delete({ where: { id, userId: req.user.id } });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

const clearAllNotifications = async (req, res) => {
    try {
        await prisma.notification.deleteMany({ where: { userId: req.user.id } });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
};
module.exports = { 
    createProfile, 
    updateProfile,
    getProfile, 
    requestPlatformVerification,
    verifyPlatform,
    generateSkills,
    addExperience,
    removeExperience,
    addCertification,
    removeCertification,
    removePlatform,
    updateSoftSkills,
    getNotifications,
    markNotificationRead,
    getDashboardStats,
    deleteNotification,
    clearAllNotifications
};
