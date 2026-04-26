const crypto = require('crypto');

// GraphQL endpoint for LeetCode
const LEETCODE_API_URL = 'https://leetcode.com/graphql';

/**
 * Generate a unique verification token for a student
 * @param {number} studentId
 * @returns {string}
 */
const generateVerificationToken = (studentId) => {
    return `inturn_verify_${studentId}_${crypto.randomBytes(4).toString('hex')}`;
};

/**
 * Fetch public profile data from LeetCode
 * @param {string} username
 * @returns {Promise<Object>}
 */
const fetchLeetcodeProfile = async (username) => {
    const query = `
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    aboutMe
                    countryName
                    ranking
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
            userContestRanking(username: $username) {
                rating
                globalRanking
                attendedContestsCount
            }
        }
    `;

    try {
        const response = await fetch(LEETCODE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        const data = await response.json();

        if (data.errors) {
            throw new Error(`LeetCode API Error: ${data.errors[0].message}`);
        }

        if (!data.data.matchedUser) {
            throw new Error('User not found on LeetCode');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching LeetCode profile:', error.message);
        throw error;
    }
};

/**
 * Verify if the user owns the LeetCode profile by checking if the token is in their "aboutMe" or "countryName"
 * @param {string} username
 * @param {string} token
 * @returns {Promise<boolean>}
 */
const verifyOwnership = async (username, token) => {
    try {
        const data = await fetchLeetcodeProfile(username);
        const profile = data.matchedUser.profile;

        if (!profile) return false;

        const aboutMe = profile.aboutMe || '';
        const countryName = profile.countryName || '';

        // Check if the token exists in aboutMe or countryName
        return aboutMe.includes(token) || countryName.includes(token);
    } catch (error) {
        return false;
    }
};

/**
 * Parse raw LeetCode data into a standardized stats object
 * @param {Object} rawData
 * @returns {Object}
 */
const parseStats = (rawData) => {
    const submitStats = rawData.matchedUser.submitStats.acSubmissionNum;
    
    const easy = submitStats.find(s => s.difficulty === 'Easy')?.count || 0;
    const medium = submitStats.find(s => s.difficulty === 'Medium')?.count || 0;
    const hard = submitStats.find(s => s.difficulty === 'Hard')?.count || 0;
    const total = submitStats.find(s => s.difficulty === 'All')?.count || 0;

    const contestRanking = rawData.userContestRanking || {};

    return {
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
        totalSolved: total,
        contestRating: Math.round(contestRanking.rating || 0),
        attendedContestsCount: contestRanking.attendedContestsCount || 0,
        globalRanking: contestRanking.globalRanking || null,
        profileRanking: rawData.matchedUser.profile.ranking || null
    };
};

module.exports = {
    generateVerificationToken,
    fetchLeetcodeProfile,
    verifyOwnership,
    parseStats
};
