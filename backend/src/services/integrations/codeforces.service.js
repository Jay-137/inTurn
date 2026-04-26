const crypto = require('crypto');

// Codeforces public API endpoint
const CODEFORCES_API_URL = 'https://codeforces.com/api';

/**
 * Generate a unique verification token for a student
 * @param {number} studentId
 * @returns {string}
 */
const generateVerificationToken = (studentId) => {
    return `inturn_cf_${studentId}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Fetch user info from Codeforces
 * @param {string} handle
 * @returns {Promise<Object>}
 */
const fetchCodeforcesProfile = async (handle) => {
    try {
        const response = await fetch(`${CODEFORCES_API_URL}/user.info?handles=${handle}`);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Codeforces API Error: ${data.comment}`);
        }

        return data.result[0];
    } catch (error) {
        console.error('Error fetching Codeforces profile:', error.message);
        throw error;
    }
};

/**
 * Fetch user status (submissions) to calculate problem stats
 * @param {string} handle
 * @returns {Promise<Array>}
 */
const fetchUserSubmissions = async (handle) => {
    try {
        const response = await fetch(`${CODEFORCES_API_URL}/user.status?handle=${handle}`);
        const data = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Codeforces API Error: ${data.comment}`);
        }

        return data.result;
    } catch (error) {
        console.error('Error fetching Codeforces submissions:', error.message);
        throw error;
    }
};

/**
 * Verify if the user owns the Codeforces profile by checking if the token is in their "firstName", "lastName", or "organization"
 * @param {string} handle
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const verifyOwnership = async (handle, token) => {
    try {
        const profile = await fetchCodeforcesProfile(handle);
        
        const firstName = profile.firstName || '';
        const lastName = profile.lastName || '';
        const organization = profile.organization || '';

        return firstName.includes(token) || lastName.includes(token) || organization.includes(token);
    } catch (error) {
        return false;
    }
};

/**
 * Parse raw Codeforces data into a standardized stats object
 * @param {Object} profile
 * @param {Array} submissions
 * @returns {Object}
 */
const parseStats = (profile, submissions = []) => {
    // Only count 'OK' verdicts for solved problems
    const solvedSubmissions = submissions.filter(s => s.verdict === 'OK');
    
    // Use a Set to only count unique problems solved
    const uniqueSolvedProblemIds = new Set(
        solvedSubmissions.map(s => `${s.problem.contestId}-${s.problem.index}`)
    );
    
    let totalSolved = uniqueSolvedProblemIds.size;
    
    // Categorize difficulty based on Codeforces problem rating
    let easy = 0;   // Rating <= 1200
    let medium = 0; // Rating > 1200 && <= 1800
    let hard = 0;   // Rating > 1800
    let unrated = 0;

    // To prevent counting the same problem's difficulty multiple times, we need to track seen problems
    const seenProblems = new Set();

    solvedSubmissions.forEach(sub => {
        const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!seenProblems.has(problemKey)) {
            seenProblems.add(problemKey);
            const rating = sub.problem.rating;
            if (rating) {
                if (rating <= 1200) easy++;
                else if (rating <= 1800) medium++;
                else hard++;
            } else {
                unrated++;
            }
        }
    });

    return {
        contestRating: profile.rating || 0,
        maxRating: profile.maxRating || 0,
        rank: profile.rank || 'unrated',
        maxRank: profile.maxRank || 'unrated',
        totalSolved,
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        unratedSolved: unrated
    };
};

module.exports = {
    generateVerificationToken,
    fetchCodeforcesProfile,
    fetchUserSubmissions,
    verifyOwnership,
    parseStats
};
