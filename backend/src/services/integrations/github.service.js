const crypto = require('crypto');

const GITHUB_API_URL = 'https://api.github.com';

/**
 * Generate a unique verification token for a student
 * @param {number} studentId
 * @returns {string}
 */
const generateVerificationToken = (studentId) => {
    return `inturn_gh_${studentId}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Fetch headers, potentially including auth if configured
 * @returns {Object}
 */
const getHeaders = () => {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    if (process.env.GITHUB_PAT) {
        // Strip any accidental quotes or whitespace
        const token = process.env.GITHUB_PAT.replace(/^["']|["']$/g, '').trim();
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

/**
 * Fetch user profile from GitHub
 * @param {string} username
 * @returns {Promise<Object>}
 */
const fetchGithubProfile = async (username) => {
    try {
        const response = await fetch(`${GITHUB_API_URL}/users/${username}`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub profile:', error.message);
        throw error;
    }
};

/**
 * Fetch user repositories from GitHub
 * @param {string} username
 * @returns {Promise<Array>}
 */
const fetchGithubRepos = async (username) => {
    try {
        const response = await fetch(`${GITHUB_API_URL}/users/${username}/repos?per_page=100&sort=updated`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub repos:', error.message);
        throw error;
    }
};

const fetchGithubRepoLanguages = async (repo) => {
    try {
        const response = await fetch(repo.languages_url, { headers: getHeaders() });
        if (!response.ok) return {};
        return await response.json();
    } catch (error) {
        console.error(`Error fetching languages for ${repo.full_name}:`, error.message);
        return {};
    }
};

const fetchRepoTextFile = async (repo, path) => {
    try {
        const response = await fetch(`${GITHUB_API_URL}/repos/${repo.full_name}/contents/${path}`, {
            headers: getHeaders()
        });
        if (!response.ok) return null;

        const file = await response.json();
        if (!file || file.type !== 'file' || !file.content) return null;
        return Buffer.from(file.content, 'base64').toString('utf8');
    } catch (error) {
        return null;
    }
};

const collectDependencyNames = async (repo) => {
    const dependencyNames = new Set();

    // --- Node.js / JavaScript ---
    const packageJson = await fetchRepoTextFile(repo, 'package.json');
    if (packageJson) {
        try {
            const parsed = JSON.parse(packageJson);
            [
                parsed.dependencies,
                parsed.devDependencies,
                parsed.peerDependencies,
                parsed.optionalDependencies
            ].forEach((group) => {
                if (group && typeof group === 'object') {
                    Object.keys(group).forEach((name) => dependencyNames.add(name.toLowerCase()));
                }
            });
            dependencyNames.add('nodejs');
        } catch (error) {
            console.error(`Unable to parse package.json for ${repo.full_name}:`, error.message);
        }
    }

    // --- Python ---
    const requirements = await fetchRepoTextFile(repo, 'requirements.txt');
    if (requirements) {
        requirements
            .split(/\r?\n/)
            .map((line) => line.trim().split(/[=<>~! ]/)[0])
            .filter(Boolean)
            .forEach((name) => dependencyNames.add(name.toLowerCase()));
    }

    // --- Java / Spring Boot ---
    const pomXml = await fetchRepoTextFile(repo, 'pom.xml');
    if (pomXml) {
        dependencyNames.add('java');
        if (pomXml.includes('spring-boot')) {
            dependencyNames.add('springboot');
            dependencyNames.add('spring-boot');
            dependencyNames.add('spring');
        }
        if (pomXml.includes('spring-data-jpa')) dependencyNames.add('jpa');
        if (pomXml.includes('postgresql')) dependencyNames.add('postgresql');
        if (pomXml.includes('mysql')) dependencyNames.add('mysql');
        if (pomXml.includes('mongodb')) dependencyNames.add('mongodb');
    }

    const buildGradle = await fetchRepoTextFile(repo, 'build.gradle');
    if (buildGradle) {
        dependencyNames.add('java');
        if (buildGradle.includes('spring-boot')) {
            dependencyNames.add('springboot');
            dependencyNames.add('spring-boot');
            dependencyNames.add('spring');
        }
        if (buildGradle.includes('postgresql')) dependencyNames.add('postgresql');
        if (buildGradle.includes('mysql')) dependencyNames.add('mysql');
    }

    const buildGradleKts = await fetchRepoTextFile(repo, 'build.gradle.kts');
    if (buildGradleKts) {
        dependencyNames.add('java');
        if (buildGradleKts.includes('spring-boot')) {
            dependencyNames.add('springboot');
            dependencyNames.add('spring-boot');
            dependencyNames.add('spring');
        }
    }

    console.log(`[GitHub] ${repo.full_name} deps:`, Array.from(dependencyNames).join(', ') || '(none)');
    return Array.from(dependencyNames);
};

/**
 * Verify if the user owns the GitHub profile by checking if the token is in their "bio"
 * @param {string} username
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const verifyOwnership = async (username, token) => {
    try {
        const profile = await fetchGithubProfile(username);
        const bio = profile.bio || '';
        return bio.includes(token);
    } catch (error) {
        return false;
    }
};

/**
 * Parse raw GitHub data into a standardized stats object
 * @param {Object} profile
 * @param {Array} repos
 * @returns {Object}
 */
const parseStats = (profile, repos = []) => {
    let totalStars = 0;
    let totalForks = 0;
    const languageMap = {};
    const frameworkSet = new Set();

    // Only count repositories that are not forks
    const originalRepos = repos.filter(repo => !repo.fork);

    originalRepos.forEach(repo => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;

        if (repo.language) {
            languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }

        // Detect frameworks from topics, name, OR description
        const searchTags = [
            ...(repo.topics || []), 
            repo.name.toLowerCase(),
            (repo.description || "").toLowerCase()
        ];
        const frameworkKeywords = [
            'react', 'express', 'node', 'spring', 'springboot', 'spring-boot', 
            'django', 'flutter', 'nextjs', 'tailwind', 'mongodb', 'postgresql', 
            'aws', 'docker', 'kubernetes', 'vue', 'angular', 'bootstrap', 
            'flask', 'pytorch', 'tensorflow'
        ];
        
        frameworkKeywords.forEach(kw => {
            if (searchTags.some(tag => tag.toLowerCase().includes(kw))) {
                frameworkSet.add(kw);
            }
        });
    });

    // Sort languages by frequency
    const topLanguages = Object.keys(languageMap)
        .sort((a, b) => languageMap[b] - languageMap[a])
        .slice(0, 5); // top 5 languages

    return {
        followers: profile.followers,
        publicReposCount: profile.public_repos,
        originalReposCount: originalRepos.length,
        totalStars,
        totalForks,
        topLanguages,
        frameworks: Array.from(frameworkSet),
        languageBreakdown: languageMap
    };
};

const parseStatsWithRepoSignals = async (profile, repos = []) => {
    let totalStars = 0;
    let totalForks = 0;
    const languageBytes = {};
    const frameworkSet = new Set();
    const dependencySet = new Set();

    const originalRepos = repos.filter(repo => !repo.fork);
    const frameworkKeywords = [
        'react', 'react-native', 'express', 'node', 'nodejs', 'spring', 'springboot', 'spring-boot',
        'django', 'flutter', 'nextjs', 'next', 'tailwind', 'tailwindcss', 'mongodb', 'postgresql',
        'postgres', 'pg', 'mysql', 'mysql2', 'mariadb', 'redis', 'firebase', 'supabase', 'aws', 'docker',
        'kubernetes', 'vue', 'angular', 'bootstrap', 'flask', 'fastapi', 'pytorch', 'tensorflow',
        'prisma', 'mongoose', 'sequelize', '@prisma/client', 'java', 'jpa'
    ];

    // Also map exact dependency names to framework keywords
    const DEP_TO_FRAMEWORK = {
        '@prisma/client': 'prisma',
        'pg': 'postgresql',
        'mysql2': 'mysql',
        'mongodb': 'mongodb',
        'mongoose': 'mongoose',
        'express': 'express',
        'next': 'nextjs',
        'react': 'react',
        'react-native': 'react-native',
        'sequelize': 'sequelize',
        'firebase': 'firebase',
        'redis': 'redis',
        '@supabase/supabase-js': 'supabase',
    };

    await Promise.all(originalRepos.map(async (repo) => {
        totalStars += repo.stargazers_count || 0;
        totalForks += repo.forks_count || 0;

        const languages = await fetchGithubRepoLanguages(repo);
        Object.entries(languages || {}).forEach(([language, bytes]) => {
            languageBytes[language] = (languageBytes[language] || 0) + Number(bytes || 0);
        });

        const dependencyNames = await collectDependencyNames(repo);
        dependencyNames.forEach((name) => dependencySet.add(name));

        const searchTags = [
            ...(repo.topics || []),
            repo.name || '',
            repo.description || '',
            ...dependencyNames
        ].map((tag) => tag.toLowerCase());

        frameworkKeywords.forEach((kw) => {
            if (searchTags.some((tag) => tag.includes(kw))) frameworkSet.add(kw);
        });

        // Exact dependency name matches
        dependencyNames.forEach((dep) => {
            if (DEP_TO_FRAMEWORK[dep]) frameworkSet.add(DEP_TO_FRAMEWORK[dep]);
        });
    }));

    const topLanguages = Object.keys(languageBytes)
        .sort((a, b) => languageBytes[b] - languageBytes[a])
        .slice(0, 8);

    return {
        followers: profile.followers || 0,
        publicReposCount: profile.public_repos || 0,
        originalReposCount: originalRepos.length,
        totalStars,
        totalForks,
        topLanguages,
        frameworks: Array.from(frameworkSet),
        dependencies: Array.from(dependencySet),
        languageBreakdown: languageBytes
    };
};

module.exports = {
    generateVerificationToken,
    fetchGithubProfile,
    fetchGithubRepos,
    verifyOwnership,
    parseStats,
    parseStatsWithRepoSignals
};
