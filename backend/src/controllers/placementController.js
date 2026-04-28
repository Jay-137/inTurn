const prisma = require('../utils/prisma');

// [RECRUITER ONLY] Step 1: Select a candidate
const selectCandidate = async (req, res) => {
    try {
        const { jobId, studentId } = req.body;

        // 1. Verify the student actually applied for this job
        const application = await prisma.application.findFirst({
            where: { jobId, studentId }
        });

        if (!application) {
            return res.status(404).json({ error: 'Invalid selection: Candidate has not applied for this job.' });
        }

        // 2. Check if already selected to prevent duplicates
        const existingSelection = await prisma.placementSelection.findFirst({
            where: { jobId, studentId }
        });

        if (existingSelection) {
            return res.status(400).json({ error: 'Candidate has already been selected for this job.' });
        }

        // 3. Create the selection proposal
        const selection = await prisma.placementSelection.create({
            data: {
                jobId,
                studentId,
                status: 'SELECTED_BY_RECRUITER'
            }
        });

        await prisma.application.updateMany({
            where: { jobId, studentId },
            data: { status: 'SHORTLISTED' }
        });

        res.status(201).json({ message: 'Candidate selected. Pending university approval.', selection });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to select candidate.' });
    }
};

// [UNIVERSITY ONLY] Step 2: Approve the placement
const approvePlacement = async (req, res) => {
    try {
        const selectionId = parseInt(req.params.selectionId, 10);

        // 1. Fetch the selection record
        const selection = await prisma.placementSelection.findUnique({
            where: { id: selectionId },
            include: { student: true } // Pull the student data simultaneously
        });

        if (!selection) {
            return res.status(404).json({ error: 'Selection record not found.' });
        }

        if (selection.status === 'APPROVED_BY_UNIVERSITY') {
            return res.status(400).json({ error: 'This placement is already approved.' });
        }

       // 2. Double-check that the student hasn't been placed elsewhere in the meantime
        if (selection.student.placementStatus === 'PLACED') {
            
            // Automatically update the selection to rejected so it doesn't sit in limbo
            await prisma.placementSelection.update({
                where: { id: selectionId },
                data: { status: 'REJECTED_BY_UNIVERSITY' }
            });

            return res.status(400).json({ 
                error: 'Conflict: This student has already been placed in another job. The selection has been automatically rejected.' 
            });
        }

        // 3. The Transaction: Update the selection AND the student's global status at the exact same time
        const [updatedSelection, updatedStudent] = await prisma.$transaction([
            prisma.placementSelection.update({
                where: { id: selectionId },
                data: { status: 'APPROVED_BY_UNIVERSITY' }
            }),
            prisma.student.update({
                where: { id: selection.studentId },
                data: { placementStatus: 'PLACED' }
            })
        ]);

        res.status(200).json({ 
            message: 'Placement approved. Student is now officially marked as PLACED.', 
            selection: updatedSelection 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve placement.' });
    }
};

module.exports = { selectCandidate, approvePlacement };
