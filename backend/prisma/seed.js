const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcrypt');

// Parse URL and initialize adapter (same as utils/prisma.js)
const dbUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    connectionLimit: 10
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // 1. TRUNCATE ALL TABLES (Order matters due to foreign keys)
    console.log('Cleaning database...');
        const tables = [
            'PlacementSelection', 'Application', 'JobSkill', 'Job', 
            'StudentSkill', 'Skill', 'ExternalProfile', 'Student', 
            'AcademicUnit', 'University', 'User'
        ];

        // The transaction forces Prisma to use exactly ONE connection for all these commands
        await prisma.$transaction(async (tx) => {
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
            
            for (const table of tables) {
                // DELETE clears the data without triggering DDL foreign key blocks
                await tx.$executeRawUnsafe(`DELETE FROM \`${table}\`;`);
                // ALTER TABLE resets the ID back to 1
                await tx.$executeRawUnsafe(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;`);
            }
            
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        });
        console.log('Database cleaned and IDs reset.');

    // 2. CREATE USERS
    const password = await bcrypt.hash('password123', 10);
    
    const uniAdmin = await prisma.user.create({ data: { name: 'Admin', email: 'admin@uni.edu', password, role: 'UNIVERSITY' } });
    const recruiter = await prisma.user.create({ data: { name: 'Recruiter', email: 'hr@techcorp.com', password, role: 'RECRUITER' } });
    const student1User = await prisma.user.create({ data: { name: 'Alice Smith', email: 'alice@student.edu', password, role: 'STUDENT' } });
    const student2User = await prisma.user.create({ data: { name: 'Bob Jones', email: 'bob@student.edu', password, role: 'STUDENT' } });
    const student3User = await prisma.user.create({ data: { name: 'Charlie Brown', email: 'charlie@student.edu', password, role: 'STUDENT' } });

    // 3. CREATE UNIVERSITY & ACADEMIC HIERARCHY
    const uni = await prisma.university.create({ data: { name: 'Global Tech University' } });
    
    const engineering = await prisma.academicUnit.create({
        data: { name: 'School of Engineering', type: 'School', universityId: uni.id }
    });
    const cseDept = await prisma.academicUnit.create({
        data: { name: 'Computer Science', type: 'Department', parentId: engineering.id, universityId: uni.id }
    });
    const cseSectionA = await prisma.academicUnit.create({
        data: { name: 'Section A', type: 'Section', parentId: cseDept.id, universityId: uni.id }
    });

    // 4. CREATE SKILL HIERARCHY
    const devSkill = await prisma.skill.create({ data: { name: 'Development', type: 'Category' } });
    const reactSkill = await prisma.skill.create({ data: { name: 'React', type: 'Frontend', parentId: devSkill.id } });
    const nodeSkill = await prisma.skill.create({ data: { name: 'Node.js', type: 'Backend', parentId: devSkill.id } });
    
    const dsaSkill = await prisma.skill.create({ data: { name: 'DSA', type: 'Category' } });
    const graphSkill = await prisma.skill.create({ data: { name: 'Graph Theory', type: 'Topic', parentId: dsaSkill.id } });

    // 5. CREATE STUDENTS
    // Alice: High CGPA, No backlogs. High React score.
    const alice = await prisma.student.create({
        data: {
            userId: student1User.id,
            universityId: uni.id,
            academicUnitId: cseSectionA.id,
            registrationStatus: 'APPROVED',
            cgpa: 9.2,
            backlogCount: 0,
            placementStatus: 'UNPLACED',
            skills: { create: [{ skillId: reactSkill.id, score: 0.9 }, { skillId: nodeSkill.id, score: 0.8 }] }
        }
    });

    // Bob: Average CGPA, 1 backlog. High Node.js score.
    const bob = await prisma.student.create({
        data: {
            userId: student2User.id,
            universityId: uni.id,
            academicUnitId: cseSectionA.id,
            registrationStatus: 'APPROVED',
            cgpa: 7.5,
            backlogCount: 1,
            placementStatus: 'UNPLACED',
            skills: { create: [{ skillId: nodeSkill.id, score: 0.9 }, { skillId: graphSkill.id, score: 0.7 }] }
        }
    });

    // Charlie: Low CGPA (to test hard filter).
    const charlie = await prisma.student.create({
        data: {
            userId: student3User.id,
            universityId: uni.id,
            academicUnitId: cseSectionA.id,
            registrationStatus: 'APPROVED',
            cgpa: 6.0,
            backlogCount: 0,
            placementStatus: 'UNPLACED',
            skills: { create: [{ skillId: reactSkill.id, score: 0.5 }] }
        }
    });

    // 6. CREATE JOBS (With Requirements)
    // Job 1: High CGPA required, Needs React. (Bob & Charlie should fail hard filter)
    await prisma.job.create({
        data: {
            title: 'Frontend Developer',
            minCgpa: 8.0,
            maxBacklogs: 0,
            deadline: new Date('2026-12-31T23:59:59Z'),
            skills: {
                create: [
                    { skillId: reactSkill.id, priority: 'HIGH' },
                    { skillId: nodeSkill.id, priority: 'GOOD_TO_HAVE' }
                ]
            }
        }
    });

    // Job 2: Lower CGPA required, Needs Node.js. (All can apply, but Charlie will have a low match score)
    await prisma.job.create({
        data: {
            title: 'Backend Engineer',
            minCgpa: 5.0,
            maxBacklogs: 2,
            deadline: new Date('2026-12-31T23:59:59Z'),
            skills: {
                create: [
                    { skillId: nodeSkill.id, priority: 'HIGH' },
                    { skillId: graphSkill.id, priority: 'MEDIUM' }
                ]
            }
        }
    });

    console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });