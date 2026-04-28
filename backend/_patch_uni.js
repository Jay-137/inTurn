const fs = require('fs');
let c = fs.readFileSync('src/controllers/universityController.js', 'utf8');

const newFns = `
// [UNIVERSITY ONLY] List all student certifications for review
const getCertifications = async (req, res) => {
    try {
        const certifications = await prisma.certification.findMany({
            include: {
                student: {
                    include: {
                        user: { select: { name: true, email: true } },
                        academicUnit: { select: { name: true } }
                    }
                }
            },
            orderBy: { id: 'desc' }
        });
        const mapped = certifications.map(c => ({
            id: c.id, name: c.name, platform: c.platform,
            issueDate: c.issueDate, credentialUrl: c.credentialUrl,
            verified: c.verified,
            studentName: c.student.user.name,
            studentEmail: c.student.user.email,
            studentBranch: c.student.academicUnit?.name || 'N/A'
        }));
        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch certifications.' });
    }
};

// [UNIVERSITY ONLY] Verify or reject a certification
const verifyCertification = async (req, res) => {
    try {
        const certId = parseInt(req.params.id, 10);
        const { verified } = req.body;
        const cert = await prisma.certification.update({
            where: { id: certId },
            data: { verified: !!verified }
        });
        res.json({ message: verified ? 'Certification verified' : 'Certification rejected', cert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update certification.' });
    }
};

`;

// Insert new functions before module.exports
c = c.replace(/module\.exports\s*=\s*\{/, newFns + 'module.exports = {');

// Add to exports
c = c.replace(/updateSettings\s*\r?\n\};/, 'updateSettings,\n    getCertifications,\n    verifyCertification\n};');

fs.writeFileSync('src/controllers/universityController.js', c);
console.log('Done - certification endpoints added');
