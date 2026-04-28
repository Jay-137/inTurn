const prisma = require('../../utils/prisma');

// ─── Skill Taxonomy ──────────────────────────────────────────────────────────
// Each skill maps to one or more categories.
// When matching, exact skill match = full credit, same-category match = partial credit.
const SKILL_CATEGORIES = {
    // Frontend
    'REACT':        'FRONTEND',
    'REACT.JS':     'FRONTEND',
    'REACTJS':      'FRONTEND',
    'VUE':          'FRONTEND',
    'VUE.JS':       'FRONTEND',
    'ANGULAR':      'FRONTEND',
    'SVELTE':       'FRONTEND',
    'NEXT.JS':      'FRONTEND',
    'NEXTJS':       'FRONTEND',
    'TAILWIND':     'FRONTEND',
    'TAILWIND CSS': 'FRONTEND',
    'TAILWINDCSS':  'FRONTEND',
    'BOOTSTRAP':    'FRONTEND',
    'HTML':         'FRONTEND',
    'CSS':          'FRONTEND',
    'SASS':         'FRONTEND',

    // Backend
    'NODE':         'BACKEND',
    'NODE.JS':      'BACKEND',
    'NODEJS':       'BACKEND',
    'EXPRESS':      'BACKEND',
    'EXPRESS.JS':   'BACKEND',
    'EXPRESSJS':    'BACKEND',
    'SPRING':       'BACKEND',
    'SPRING BOOT':  'BACKEND',
    'SPRINGBOOT':   'BACKEND',
    'DJANGO':       'BACKEND',
    'FLASK':        'BACKEND',
    'FASTAPI':      'BACKEND',
    'RAILS':        'BACKEND',
    'RUBY ON RAILS':'BACKEND',
    'LARAVEL':      'BACKEND',
    'ASP.NET':      'BACKEND',
    'GRAPHQL':      'BACKEND',
    'REST':         'BACKEND',
    'RESTFUL':      'BACKEND',

    // Languages
    'JAVASCRIPT':   'LANGUAGE',
    'TYPESCRIPT':   'LANGUAGE',
    'PYTHON':       'LANGUAGE',
    'JAVA':         'LANGUAGE',
    'C++':          'LANGUAGE',
    'C#':           'LANGUAGE',
    'GO':           'LANGUAGE',
    'RUST':         'LANGUAGE',
    'KOTLIN':       'LANGUAGE',
    'SWIFT':        'LANGUAGE',
    'PHP':          'LANGUAGE',
    'RUBY':         'LANGUAGE',
    'DART':         'LANGUAGE',

    // Database
    'MONGODB':      'DATABASE',
    'MYSQL':        'DATABASE',
    'POSTGRESQL':   'DATABASE',
    'POSTGRES':     'DATABASE',
    'SQLITE':       'DATABASE',
    'REDIS':        'DATABASE',
    'FIREBASE':     'DATABASE',
    'SUPABASE':     'DATABASE',
    'SQL':          'DATABASE',
    'NOSQL':        'DATABASE',
    'DYNAMODB':     'DATABASE',

    // DevOps / Cloud
    'DOCKER':       'DEVOPS',
    'KUBERNETES':   'DEVOPS',
    'AWS':          'DEVOPS',
    'GCP':          'DEVOPS',
    'AZURE':        'DEVOPS',
    'CI/CD':        'DEVOPS',
    'JENKINS':      'DEVOPS',
    'TERRAFORM':    'DEVOPS',
    'ANSIBLE':      'DEVOPS',
    'LINUX':        'DEVOPS',
    'NGINX':        'DEVOPS',
    'HEROKU':       'DEVOPS',
    'VERCEL':       'DEVOPS',
    'NETLIFY':      'DEVOPS',

    // AI / ML / Data
    'PYTORCH':      'AI_ML',
    'TENSORFLOW':   'AI_ML',
    'KERAS':        'AI_ML',
    'SCIKIT-LEARN': 'AI_ML',
    'PANDAS':       'AI_ML',
    'NUMPY':        'AI_ML',
    'OPENCV':       'AI_ML',
    'NLP':          'AI_ML',
    'MACHINE LEARNING': 'AI_ML',
    'DEEP LEARNING':'AI_ML',
    'DATA SCIENCE': 'AI_ML',
    'LLM':          'AI_ML',

    // Mobile
    'FLUTTER':      'MOBILE',
    'REACT NATIVE': 'MOBILE',
    'ANDROID':      'MOBILE',
    'IOS':          'MOBILE',
    'SWIFTUI':      'MOBILE',
    'JETPACK COMPOSE': 'MOBILE',

    // Core CS
    'DSA':          'CORE_CS',
    'DATA STRUCTURES': 'CORE_CS',
    'ALGORITHMS':   'CORE_CS',
    'PROBLEM SOLVING': 'CORE_CS',
    'OPERATING SYSTEMS': 'CORE_CS',
    'COMPUTER NETWORKS': 'CORE_CS',
    'DBMS':         'CORE_CS',
    'OOP':          'CORE_CS',
    'SYSTEM DESIGN':'CORE_CS',

    // Web Development (general)
    'WEB DEVELOPMENT': 'WEB',
    'FULL STACK':   'WEB',
    'MERN':         'WEB',
    'MEAN':         'WEB',

    // Academic
    'ACADEMIC FUNDAMENTALS': 'ACADEMIC',
};

const PRIORITY_WEIGHTS = {
    HIGH: 1.0,
    MEDIUM: 0.6,
    LOW: 0.3,
    GOOD_TO_HAVE: 0.1
};

// How much credit to give for a same-category match vs an exact match
const CATEGORY_MATCH_FACTOR = 0.5; // 50% credit for same-category match

/**
 * Normalize a skill name for comparison.
 * Strips whitespace, dots, and converts to uppercase.
 */
function normalizeSkillName(name) {
    return name.trim().toUpperCase();
}

function normalizeBranchName(name) {
    return String(name || '')
        .trim()
        .toUpperCase()
        .replace(/&/g, 'AND')
        .replace(/[^A-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const BRANCH_CONNECTOR_WORDS = new Set(['AND', 'OF', 'THE', 'IN', 'FOR']);
const BRANCH_DESCRIPTOR_WORDS = new Set([
    'ENGINEERING',
    'TECHNOLOGY',
    'SCIENCES',
    'SCIENCE',
    'STUDIES',
    'DEPARTMENT',
    'SCHOOL',
    'BRANCH',
    'COURSE',
    'PROGRAM',
    'PROGRAMME'
]);

function tokenizeBranchName(name) {
    const normalized = normalizeBranchName(name);
    if (!normalized) return [];
    return normalized.split(' ').filter(Boolean);
}

function branchAcronym(tokens) {
    return tokens
        .filter((token) => !BRANCH_CONNECTOR_WORDS.has(token))
        .map((token) => token[0])
        .join('');
}

function branchCoreTokens(tokens) {
    return tokens.filter((token) => (
        !BRANCH_CONNECTOR_WORDS.has(token) &&
        !BRANCH_DESCRIPTOR_WORDS.has(token)
    ));
}

function tokenSetContainsAll(sourceTokens, targetTokens) {
    const source = new Set(sourceTokens);
    return targetTokens.length > 0 && targetTokens.every((token) => source.has(token));
}

function acronymsCompatible(left, right) {
    if (!left || !right) return false;
    if (left === right) return true;

    const shorter = left.length <= right.length ? left : right;
    const longer = left.length <= right.length ? right : left;

    // Handles cases such as CS <-> CSE where the extra letter usually comes
    // from a generic descriptor like Engineering. Keeps this conservative.
    return shorter.length >= 2 && longer.startsWith(shorter) && longer.length - shorter.length <= 1;
}

function branchCodeCandidates(tokens) {
    const acronym = branchAcronym(tokens);
    const compact = tokens.join('');
    const coreCompact = branchCoreTokens(tokens).join('');

    return [acronym, compact, coreCompact].filter(Boolean);
}

function branchesMatch(studentBranch, targetBranch) {
    const studentTokens = tokenizeBranchName(studentBranch);
    const targetTokens = tokenizeBranchName(targetBranch);
    if (studentTokens.length === 0 || targetTokens.length === 0) return false;

    const studentNormalized = studentTokens.join(' ');
    const targetNormalized = targetTokens.join(' ');
    const studentCompact = studentTokens.join('');
    const targetCompact = targetTokens.join('');

    if (studentNormalized === targetNormalized || studentCompact === targetCompact) {
        return true;
    }

    const studentCore = branchCoreTokens(studentTokens);
    const targetCore = branchCoreTokens(targetTokens);

    if (
        tokenSetContainsAll(studentCore, targetCore) ||
        tokenSetContainsAll(targetCore, studentCore)
    ) {
        return true;
    }

    const studentCodes = branchCodeCandidates(studentTokens);
    const targetCodes = branchCodeCandidates(targetTokens);
    for (const studentCode of studentCodes) {
        for (const targetCode of targetCodes) {
            if (acronymsCompatible(studentCode, targetCode)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get the category of a skill name from the taxonomy.
 * Returns null if no category is found.
 */
function getSkillCategory(skillName) {
    const normalized = normalizeSkillName(skillName);
    
    // Direct lookup
    if (SKILL_CATEGORIES[normalized]) {
        return SKILL_CATEGORIES[normalized];
    }
    
    // Try without ".JS" suffix
    const withoutJs = normalized.replace(/\.JS$/, '').replace(/JS$/, '');
    if (SKILL_CATEGORIES[withoutJs]) {
        return SKILL_CATEGORIES[withoutJs];
    }

    // Try without spaces
    const noSpaces = normalized.replace(/\s+/g, '');
    for (const [key, cat] of Object.entries(SKILL_CATEGORIES)) {
        if (key.replace(/\s+/g, '') === noSpaces) {
            return cat;
        }
    }

    return null;
}

/**
 * Find the best match for a required skill from the student's skill map.
 * Returns { score, matchType, matchedSkillName }
 *   matchType: 'exact' | 'category' | 'none'
 */
function findBestMatch(requiredSkillName, studentSkillEntries) {
    const reqNorm = normalizeSkillName(requiredSkillName);
    const reqCategory = getSkillCategory(requiredSkillName);

    let bestExact = null;
    let bestCategory = null;

    for (const { name, score } of studentSkillEntries) {
        const studentNorm = normalizeSkillName(name);

        // Check exact match (with fuzzy normalization)
        if (studentNorm === reqNorm ||
            studentNorm.replace(/\.JS$/, '') === reqNorm.replace(/\.JS$/, '') ||
            studentNorm.replace(/\s+/g, '') === reqNorm.replace(/\s+/g, '')) {
            if (!bestExact || score > bestExact.score) {
                bestExact = { score, matchType: 'exact', matchedSkillName: name };
            }
        }
        // Check category match
        else if (reqCategory) {
            const studentCategory = getSkillCategory(name);
            if (studentCategory && studentCategory === reqCategory) {
                if (!bestCategory || score > bestCategory.score) {
                    bestCategory = { score, matchType: 'category', matchedSkillName: name };
                }
            }
        }
    }

    if (bestExact) return bestExact;
    if (bestCategory) {
        // Apply partial credit factor for category matches
        return {
            score: bestCategory.score * CATEGORY_MATCH_FACTOR,
            matchType: 'category',
            matchedSkillName: bestCategory.matchedSkillName,
        };
    }
    return { score: 0, matchType: 'none', matchedSkillName: null };
}

/**
 * Evaluates a student against job and university filters.
 * Returns eligibility status, match score, and transparent feedback.
 */
const evaluateEligibility = async (student, job, universityFilter = null) => {
    let isEligible = true;
    const feedback = [];

    // 1. Basic Academic Checks (Job Level)
    if (job.minCgpa && student.cgpa < job.minCgpa) {
        isEligible = false;
        feedback.push(`CGPA (${student.cgpa}) is below the required ${job.minCgpa}`);
    }

    if (job.maxBacklogs !== null && job.maxBacklogs !== undefined && student.backlogCount > job.maxBacklogs) {
        isEligible = false;
        feedback.push(`Backlogs (${student.backlogCount}) exceed the maximum allowed (${job.maxBacklogs})`);
    }

    // 2. Branch and Year Checks
    if (job.targetBranches && Array.isArray(job.targetBranches) && job.targetBranches.length > 0) {
        const studentBranch = student.branch || student.academicUnit?.name;
        if (!studentBranch || !job.targetBranches.some((targetBranch) => branchesMatch(studentBranch, targetBranch))) {
            isEligible = false;
            feedback.push(`Your branch (${studentBranch || 'Not set'}) is not eligible. Target branches: ${job.targetBranches.join(', ')}`);
        }
    }

    if (job.targetYears && Array.isArray(job.targetYears) && job.targetYears.length > 0) {
        if (!student.passingYear || !job.targetYears.includes(student.passingYear)) {
            isEligible = false;
            feedback.push(`Your passing year (${student.passingYear || 'Not set'}) is not eligible. Target years: ${job.targetYears.join(', ')}`);
        }
    }

    // 3. University Baseline Checks (Optional)
    if (universityFilter) {
        if (universityFilter.minGlobalCgpa && student.cgpa < universityFilter.minGlobalCgpa) {
            isEligible = false;
            feedback.push(`Blocked by University: CGPA must be at least ${universityFilter.minGlobalCgpa}`);
        }
        if (universityFilter.maxGlobalBacklogs !== null && student.backlogCount > universityFilter.maxGlobalBacklogs) {
            isEligible = false;
            feedback.push(`Blocked by University: Max backlogs allowed is ${universityFilter.maxGlobalBacklogs}`);
        }
    }

    // 4. Calculate Match Score based on Job Skills (Semantic Matching)
    let matchScore = null;

    // Fetch job skills
    const jobSkills = await prisma.jobSkill.findMany({
        where: { jobId: job.id },
        include: { skill: true }
    });

    if (jobSkills.length > 0) {
        // Fetch student skills
        const studentSkills = await prisma.studentSkill.findMany({
            where: { studentId: student.id },
            include: { skill: true }
        });

        if (studentSkills.length === 0) {
            matchScore = null;
            feedback.push("Skills not yet generated. Please link platforms and generate skills first.");
        } else {
            // Build student skill entries for matching
            const studentSkillEntries = studentSkills.map(ss => ({
                name: ss.skill.name,
                score: ss.score,
            }));

            let totalWeightedScore = 0;
            let totalWeights = 0;

            for (const reqSkill of jobSkills) {
                const weight = PRIORITY_WEIGHTS[reqSkill.priority.toUpperCase()] || 0;
                const match = findBestMatch(reqSkill.skill.name, studentSkillEntries);

                totalWeightedScore += (weight * match.score);
                totalWeights += weight;

                // Generate transparent feedback for each skill
                const priorityLabel = reqSkill.priority.charAt(0) + reqSkill.priority.slice(1).toLowerCase();

                if (match.matchType === 'exact') {
                    feedback.push(`✓ ${reqSkill.skill.name} [${priorityLabel}]: Direct match found (${Math.round(match.score * 100)}%)`);
                } else if (match.matchType === 'category') {
                    const actualScore = Math.round(match.score * 100);
                    feedback.push(`~ ${reqSkill.skill.name} [${priorityLabel}]: Partial match via ${match.matchedSkillName} (${actualScore}%)`);
                } else {
                    feedback.push(`✗ ${reqSkill.skill.name} [${priorityLabel}]: No matching skill found`);
                }
            }

            if (totalWeights > 0) {
                matchScore = Math.round((totalWeightedScore / totalWeights) * 100);
            } else {
                matchScore = 100;
            }
        }
    } else {
        // No job skills required, 100% match
        matchScore = 100;
        feedback.push("This job has no specific skill requirements.");
    }

    return {
        isEligible,
        matchScore,
        feedback
    };
};

module.exports = {
    evaluateEligibility,
    branchesMatch
};
