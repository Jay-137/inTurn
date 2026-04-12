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

// [UNIVERSITY ONLY] View student roster with optional filtering
const getStudents = async (req, res) => {
    try {
        const { academicUnitId, placementStatus } = req.query;
        
        // Dynamically build our database filters based on the query parameters provided
        const whereClause = {};
        
        if (academicUnitId) {
            whereClause.academicUnitId = parseInt(academicUnitId, 10);
        }
        
        if (placementStatus) {
            whereClause.placementStatus = placementStatus.toUpperCase();
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            include: {
                user: { select: { name: true, email: true } },
                academicUnit: { select: { name: true, type: true } },
                skills: { include: { skill: true } }
            }
        });

        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student roster.' });
    }
};

module.exports = { approveStudent, getStudents };