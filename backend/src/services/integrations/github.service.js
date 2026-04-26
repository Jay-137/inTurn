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
        headers['Authorization'] = `token ${process.env.GITHUB_PAT}`;
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

module.exports = {
    generateVerificationToken,
    fetchGithubProfile,
    fetchGithubRepos,
    verifyOwnership,
    parseStats
};
