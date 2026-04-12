const prisma = require('../utils/prisma');

const createProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From the JWT middleware
        const { universityId, academicUnitId, cgpa, backlogCount } = req.body;

        // 1. Check if profile already exists
        const existingProfile = await prisma.student.findUnique({
            where: { userId: userId }
        });

        if (existingProfile) {
            return res.status(400).json({ error: 'Student profile already exists for this user.' });
        }

        // 2. Create the profile
        const student = await prisma.student.create({
            data: {
                userId,
                universityId,
                academicUnitId,
                cgpa,
                backlogCount,
                registrationStatus: 'PENDING', // Needs university approval later
                placementStatus: 'UNPLACED'
            }
        });

        res.status(201).json({ message: 'Profile created successfully', student });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create student profile.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.userId, 10);

        // Fetch the student with all their nested relational data
        const student = await prisma.student.findUnique({
            where: { userId: requestedUserId },
            include: {
                user: { select: { name: true, email: true } },
                university: { select: { name: true } },
                academicUnit: { select: { name: true, type: true } },
                skills: {
                    include: { skill: true }
                },
                externalProfiles: true
            }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student profile.' });
    }
};

module.exports = { createProfile, getProfile };