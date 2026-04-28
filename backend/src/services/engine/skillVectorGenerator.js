/**
 * Skill Vector Generator
 * Calculates normalized scores (0 to 1) for various skills based on:
 *   - External platform stats (GitHub, LeetCode, Codeforces)
 *   - Internship experience skills
 *   - Certification platform/names
 *   - Academic data (CGPA, core subjects)
 */

// Sigmoid function to normalize rating systems
const normalizeRating = (rating, base = 1500, scale = 400) => {
    const r = Number(rating) || 0;
    if (r === 0) return 0;
    return 1 / (1 + Math.exp(-(r - base) / scale));
};

/**
 * Calculate DSA Score from LeetCode and Codeforces
 */
const calculateDsaScore = (leetcodeStats, codeforcesStats) => {
    let lcScore = 0;
    let cfScore = 0;

    if (leetcodeStats) {
        const ratingScore = normalizeRating(leetcodeStats.contestRating || 0, 1500, 300);
        const problemScoreRaw = (Number(leetcodeStats.easySolved || 0) * 1) +
                                (Number(leetcodeStats.mediumSolved || 0) * 5) +
                                (Number(leetcodeStats.hardSolved || 0) * 25);
        const problemScore = Math.min(1.0, problemScoreRaw / 2000);
        lcScore = (ratingScore * 0.6) + (problemScore * 0.4);
    }

    if (codeforcesStats) {
        const ratingScore = normalizeRating(codeforcesStats.contestRating || 0, 1400, 400);
        const problemScoreRaw = (Number(codeforcesStats.easySolved || 0) * 1) +
                                (Number(codeforcesStats.mediumSolved || 0) * 10) +
                                (Number(codeforcesStats.hardSolved || 0) * 40);
        const problemScore = Math.min(1.0, problemScoreRaw / 2000);
        cfScore = (ratingScore * 0.7) + (problemScore * 0.3);
    }

    if (lcScore > 0 && cfScore > 0) {
        return Math.min(1.0, Math.max(lcScore, cfScore) + 0.05);
    }
    return lcScore > 0 ? lcScore : cfScore;
};

/**
 * Calculate tech score for a specific language from GitHub stats
 */
const calculateTechScore = (githubStats, targetLanguage) => {
    if (!githubStats || !githubStats.languageBreakdown) return 0.0;

    const langCount = Number(githubStats.languageBreakdown[targetLanguage]) || 0;
    if (langCount === 0) return 0.0;

    const volumeScore = langCount > 1000
        ? Math.min(1.0, Math.log10(langCount) / 6)
        : Math.min(1.0, langCount / 5);
    const qualityMultiplier = Math.min(1.5, 1 + (Number(githubStats.totalStars || 0) / 50));
    let rawScore = volumeScore * qualityMultiplier;

    if (Array.isArray(githubStats.topLanguages) && githubStats.topLanguages.slice(0, 3).includes(targetLanguage)) {
        rawScore += 0.2;
    }

    return Math.min(1.0, rawScore);
};

// Map of framework keywords (from GitHub) to canonical skill names
const FRAMEWORK_MAP = {
    'react': 'React.js',
    'reactjs': 'React.js',
    'react-native': 'React Native',
    'node': 'Node.js',
    'nodejs': 'Node.js',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'spring': 'Spring Boot',
    'springboot': 'Spring Boot',
    'spring-boot': 'Spring Boot',
    'django': 'Django',
    'flask': 'Flask',
    'fastapi': 'FastAPI',
    'nextjs': 'Next.js',
    'next': 'Next.js',
    'nuxt': 'Nuxt.js',
    'vue': 'Vue.js',
    'vuejs': 'Vue.js',
    'angular': 'Angular',
    'svelte': 'Svelte',
    'tailwind': 'Tailwind CSS',
    'tailwindcss': 'Tailwind CSS',
    'bootstrap': 'Bootstrap',
    'flutter': 'Flutter',
    'mongodb': 'MongoDB',
    'postgresql': 'PostgreSQL',
    'postgres': 'PostgreSQL',
    'pg': 'PostgreSQL',
    'mysql': 'MySQL',
    'mysql2': 'MySQL',
    'redis': 'Redis',
    'firebase': 'Firebase',
    'supabase': 'Supabase',
    'aws': 'AWS',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'pytorch': 'PyTorch',
    'tensorflow': 'TensorFlow',
    'keras': 'Keras',
    'pandas': 'Pandas',
    'scikit-learn': 'Scikit-Learn',
    'opencv': 'OpenCV',
    'laravel': 'Laravel',
    'prisma': 'Prisma',
    '@prisma/client': 'Prisma',
    'mongoose': 'Mongoose',
    'sequelize': 'Sequelize',
    'mariadb': 'MariaDB',
};

/**
 * Normalize a skill name entered by the user (from experiences/certifications)
 * to a canonical name if possible.
 */
function normalizeUserSkill(skillName) {
    const lower = skillName.trim().toLowerCase();
    // Check if it maps to a known framework
    if (FRAMEWORK_MAP[lower]) return FRAMEWORK_MAP[lower];
    // Check common variations
    if (lower === 'js' || lower === 'javascript') return 'JavaScript';
    if (lower === 'ts' || lower === 'typescript') return 'TypeScript';
    if (lower === 'py' || lower === 'python') return 'Python';
    if (lower === 'java') return 'Java';
    if (lower === 'c++' || lower === 'cpp') return 'C++';
    if (lower === 'c#' || lower === 'csharp') return 'C#';
    if (lower === 'go' || lower === 'golang') return 'Go';
    if (lower === 'rust') return 'Rust';
    if (lower === 'kotlin') return 'Kotlin';
    if (lower === 'swift') return 'Swift';
    if (lower === 'php') return 'PHP';
    if (lower === 'ruby') return 'Ruby';
    if (lower === 'html') return 'HTML';
    if (lower === 'css') return 'CSS';
    if (lower === 'sql') return 'SQL';
    if (lower === 'git') return 'Git';
    if (lower === 'linux') return 'Linux';
    if (lower === 'dsa' || lower === 'data structures') return 'DSA';
    // Default: capitalize first letter of each word
    return skillName.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Generate full skill vector for a student based on ALL their data:
 *   - GitHub/LeetCode/Codeforces stats
 *   - Internship experience skills
 *   - Certification names
 *   - CGPA and core subjects
 */
const generateSkillVector = (student) => {
    const vector = {};
    const externalProfiles = student.externalProfiles || [];

    let lcStats = null;
    let cfStats = null;
    let ghStats = null;

    externalProfiles.forEach(profile => {
        if (!profile.isVerified) return;
        const platform = profile.platform.toLowerCase();
        if (platform === 'leetcode') lcStats = profile.stats;
        else if (platform === 'codeforces') cfStats = profile.stats;
        else if (platform === 'github') ghStats = profile.stats;
    });

    // 1. DSA / problem solving from verified coding platforms only.
    const dsaScore = calculateDsaScore(lcStats, cfStats);
    if (dsaScore > 0) {
        vector['DSA'] = Math.round(dsaScore * 100) / 100;
        vector['Problem Solving'] = Math.round(dsaScore * 100) / 100;
    }

    // 2. Academic Fundamentals from CGPA
    const academicBase = (Number(student.cgpa) || 0) / 10;
    if (academicBase > 0) {
        vector['Academic Fundamentals'] = Math.round(academicBase * 100) / 100;
    }

    // 3. Languages and Frameworks from GitHub
    if (ghStats) {
        // Languages
        const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'C#', 'Rust'];
        languages.forEach(lang => {
            const score = calculateTechScore(ghStats, lang);
            if (score > 0) vector[lang] = Math.round(score * 100) / 100;
        });

        // Also check for CSS and HTML (they appear in GitHub language breakdown)
        ['CSS', 'HTML'].forEach(lang => {
            const score = calculateTechScore(ghStats, lang);
            if (score > 0) vector[lang] = Math.round(score * 100) / 100;
        });

        // Frameworks detected by GitHub scanner (now with project counts)
        if (ghStats.frameworks && typeof ghStats.frameworks === 'object') {
            Object.entries(ghStats.frameworks).forEach(([fw, count]) => {
                const name = FRAMEWORK_MAP[fw] || (fw.charAt(0).toUpperCase() + fw.slice(1));
                const projectCount = Number(count) || 1;

                // Base score of 0.6 + 0.1 for every additional project (up to 0.9)
                let fwScore = 0.6 + (Math.min(3, projectCount - 1) * 0.1);
                
                // Extra popularity boost from stars
                if ((Number(ghStats.totalStars) || 0) > 10) fwScore += 0.1;
                if ((Number(ghStats.totalStars) || 0) > 50) fwScore += 0.1;

                const finalFwScore = Math.min(1.0, Math.round(fwScore * 100) / 100);
                vector[name] = Math.max(vector[name] || 0, finalFwScore);
            });
        }

        // Dependencies detected from package.json / pom.xml / requirements.txt
        if (Array.isArray(ghStats.dependencies)) {
            ghStats.dependencies.forEach(dep => {
                const name = FRAMEWORK_MAP[dep];
                // Only add if not already boosted by framework detection
                if (name && !vector[name]) {
                    vector[name] = 0.5;
                }
            });
        }
    }

    // 4. Skills from Internship Experiences
    if (Array.isArray(student.experiences)) {
        student.experiences.forEach(exp => {
            const skills = exp.skills;
            if (Array.isArray(skills)) {
                skills.forEach(rawSkill => {
                    const name = normalizeUserSkill(rawSkill);
                    // Experience gives a base score of 0.5 (they have hands-on experience)
                    // Boost to 0.7 if it's an internship (real-world usage)
                    const expScore = exp.type === 'internship' ? 0.7 : 0.5;
                    vector[name] = Math.max(vector[name] || 0, expScore);
                    if (name === 'DSA') {
                        vector['Problem Solving'] = Math.max(vector['Problem Solving'] || 0, expScore);
                    }
                });
            }
        });
    }

    // 5. Skills from Certifications
    if (Array.isArray(student.certifications)) {
        student.certifications.forEach(cert => {
            // Extract skill from certification name
            // e.g., "AWS Cloud Practitioner" -> "AWS"
            // e.g., "React - The Complete Guide" -> "React.js"
            const certName = (cert.name || '').toLowerCase();
            const certSkills = [];

            // Check if cert name contains known frameworks/skills
            for (const [keyword, canonicalName] of Object.entries(FRAMEWORK_MAP)) {
                if (certName.includes(keyword)) {
                    certSkills.push(canonicalName);
                }
            }

            // Check for language names
            const langChecks = ['javascript', 'typescript', 'python', 'java', 'c++', 'go', 'rust', 'kotlin', 'swift'];
            langChecks.forEach(lang => {
                if (certName.includes(lang)) {
                    certSkills.push(normalizeUserSkill(lang));
                }
            });

            if (
                certName.includes('dsa') ||
                certName.includes('algorithm') ||
                certName.includes('data structure') ||
                certName.includes('problem solving')
            ) {
                certSkills.push('DSA', 'Problem Solving');
            }

            // If no specific skill detected, use the platform as a general marker
            if (certSkills.length === 0 && cert.platform) {
                const platformLower = cert.platform.toLowerCase();
                if (platformLower.includes('coursera') || platformLower.includes('udemy') || platformLower.includes('udacity')) {
                    // Generic certification - don't add to skills
                }
            }

            certSkills.forEach(skillName => {
                // Certification gives 0.4 base score (knowledge, not necessarily hands-on)
                // Verified certification gets 0.6
                const certScore = cert.verified ? 0.6 : 0.4;
                vector[skillName] = Math.max(vector[skillName] || 0, certScore);
            });
        });
    }

    // 6. Core Subject Grades
    if (Array.isArray(student.coreSubjects)) {
        student.coreSubjects.forEach(sub => {
            const name = (sub.subjectName || '').toLowerCase();
            const grade = (sub.grade || '').toUpperCase();
            const isHighGrade = ['A', 'A+', 'S', '10', '9'].includes(grade);

            if (isHighGrade) {
                if (name.includes('data structure') || name.includes('algorithm')) {
                    vector['DSA'] = Math.min(1.0, (vector['DSA'] || 0) + 0.2);
                    vector['Problem Solving'] = Math.min(1.0, (vector['Problem Solving'] || 0) + 0.2);
                }
                if (name.includes('database') || name.includes('dbms')) {
                    vector['SQL'] = Math.min(1.0, (vector['SQL'] || 0) + 0.2);
                }
                if (name.includes('operating system')) {
                    vector['Academic Fundamentals'] = Math.min(1.0, (vector['Academic Fundamentals'] || 0) + 0.2);
                }
                if (name.includes('machine learning') || name.includes('artificial intelligence')) {
                    vector['Machine Learning'] = Math.min(1.0, (vector['Machine Learning'] || 0) + 0.2);
                }
            }
        });
    }

    console.log('[SkillVector] Generated skills:', JSON.stringify(vector, null, 2));
    return vector;
};

module.exports = {
    calculateDsaScore,
    calculateTechScore,
    generateSkillVector
};
