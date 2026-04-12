const prisma = require('./prisma');

const PRIORITY_WEIGHTS = {
    HIGH: 1.0,
    MEDIUM: 0.6,
    LOW: 0.3,
    GOOD_TO_HAVE: 0.1
};

const calculateMatchScore = async (studentId, jobId) => {
    // 1. Fetch the required skills for the job
    const jobSkills = await prisma.jobSkill.findMany({
        where: { jobId }
    });

    if (jobSkills.length === 0) return 1.0; // If job requires no specific skills, it's a 100% match

    // 2. Fetch the student's current skill scores
    const studentSkills = await prisma.studentSkill.findMany({
        where: { studentId }
    });

    // Create a lookup dictionary for fast access: { skillId: score }
    const studentSkillMap = studentSkills.reduce((map, ss) => {
        map[ss.skillId] = ss.score;
        return map;
    }, {});

    // 3. Apply the formula: (Σ(weight × skill_score)) / (Σ weights)
    let totalWeightedScore = 0;
    let totalWeights = 0;

    for (const reqSkill of jobSkills) {
        const weight = PRIORITY_WEIGHTS[reqSkill.priority.toUpperCase()] || 0;
        // If student doesn't have the skill, their score for it is 0
        const skillScore = studentSkillMap[reqSkill.skillId] || 0; 

        totalWeightedScore += (weight * skillScore);
        totalWeights += weight;
    }

    if (totalWeights === 0) return 0;

    // Return normalized score (0 to 1) rounded to 2 decimal places
    const finalScore = totalWeightedScore / totalWeights;
    return Math.round(finalScore * 100) / 100; 
};

module.exports = { calculateMatchScore };