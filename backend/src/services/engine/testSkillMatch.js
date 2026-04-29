require('dotenv').config({ path: 'backend/.env' });
const { normalizeSkillName, findBestMatch } = require('./eligibilityEngine');

console.log("--- Normalization Tests ---");
console.log("DSA ->", normalizeSkillName("DSA"));
console.log("Data Structures & Algorithms ->", normalizeSkillName("Data Structures & Algorithms"));
console.log("React.js ->", normalizeSkillName("React.js"));
console.log("Golang ->", normalizeSkillName("Golang"));

console.log("\n--- Matching Tests ---");
const studentSkills = [
    { name: "DSA", score: 0.9 },
    { name: "React", score: 0.8 },
    { name: "Go", score: 0.7 }
];

console.log("Req: Data Structures & Algorithms, Student has DSA ->", 
    findBestMatch("Data Structures & Algorithms", studentSkills));

console.log("Req: React.js, Student has React ->", 
    findBestMatch("React.js", studentSkills));

console.log("Req: Golang, Student has Go ->", 
    findBestMatch("Golang", studentSkills));

console.log("Req: DSA, Student has Data Structures and Algorithms ->",
    findBestMatch("DSA", [{ name: "Data Structures and Algorithms", score: 0.9 }]));
