require('dotenv').config();
const prisma = require('../src/utils/prisma');

async function checkData() {
  try {
    const jobs = await prisma.job.findMany({
      include: { skills: { include: { skill: true } } }
    });
    console.log('JOBS IN DB:', JSON.stringify(jobs, null, 2));

    const studentSkills = await prisma.studentSkill.findMany({
      include: { skill: true }
    });
    console.log('STUDENT SKILLS IN DB:', JSON.stringify(studentSkills, null, 2));
  } catch (err) {
    console.error('ERROR CHECKING DB:', err);
  } finally {
    process.exit(0);
  }
}

checkData();
