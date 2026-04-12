import { Card, GradientButton, ProgressBar, Badge, MatchScoreCircle } from "./shared";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "./app-context";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, MapPin, Clock, Zap, Filter, Search,
  ChevronDown, Building2, Star, ArrowRight, CheckCircle2, X,
  Target, TrendingUp, AlertCircle, Sparkles, Eye, EyeOff
} from "lucide-react";
import { useState } from "react";

const allJobs = [
  {
    id: "j1",
    title: "SDE-1 Frontend Engineer",
    company: "TechCorp",
    location: "Remote",
    type: "Full-time",
    salary: "12-18 LPA",
    match: 92,
    priority: true,
    priorityEnds: "2h 15m",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    skillAlignment: [
      { skill: "React/TypeScript", match: 96 },
      { skill: "Problem Solving", match: 88 },
      { skill: "CSS/Styling", match: 94 },
      { skill: "System Design", match: 60 },
    ],
    description: "Join our frontend team to build modern web applications. Work with React, TypeScript, and cutting-edge tools.",
    role: "Frontend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j2",
    title: "SDE Intern - Backend",
    company: "InnovateLab",
    location: "Bangalore",
    type: "Internship",
    salary: "40K/month",
    match: 87,
    priority: false,
    priorityEnds: null,
    posted: "1 day ago",
    tags: ["Python", "Django", "PostgreSQL", "DSA"],
    skillAlignment: [
      { skill: "Python/Django", match: 70 },
      { skill: "DSA", match: 92 },
      { skill: "Databases", match: 78 },
      { skill: "APIs", match: 85 },
    ],
    description: "6-month internship working on backend microservices. Great learning opportunity with mentorship.",
    role: "Backend Intern",
    roleCategory: "Intern",
  },
  {
    id: "j3",
    title: "Fresher - Full Stack Developer",
    company: "StartupX",
    location: "Hybrid (Mumbai)",
    type: "Full-time",
    salary: "8-12 LPA",
    match: 78,
    priority: true,
    priorityEnds: "5h 30m",
    posted: "3 days ago",
    tags: ["Node.js", "React", "MongoDB", "AWS"],
    skillAlignment: [
      { skill: "React", match: 95 },
      { skill: "Node.js", match: 68 },
      { skill: "MongoDB", match: 62 },
      { skill: "DevOps/AWS", match: 45 },
    ],
    description: "Build full-stack features for our growing SaaS product. Perfect for freshers who want to learn fast.",
    role: "Full Stack Developer",
    roleCategory: "Fresher",
  },
  {
    id: "j4",
    title: "SDE-1 Full Stack",
    company: "CloudNine Solutions",
    location: "Remote",
    type: "Full-time",
    salary: "15-22 LPA",
    match: 74,
    priority: false,
    priorityEnds: null,
    posted: "5 days ago",
    tags: ["React", "Node.js", "TypeScript", "Docker"],
    skillAlignment: [
      { skill: "Frontend", match: 92 },
      { skill: "Backend", match: 65 },
      { skill: "DevOps", match: 50 },
      { skill: "System Design", match: 55 },
    ],
    description: "Work on cloud-native applications. We value problem-solving ability and willingness to learn.",
    role: "Full Stack Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j5",
    title: "Frontend Intern",
    company: "DesignHub",
    location: "Delhi (On-site)",
    type: "Internship",
    salary: "35K/month",
    match: 90,
    priority: false,
    priorityEnds: null,
    posted: "1 day ago",
    tags: ["React", "CSS", "Figma", "JavaScript"],
    skillAlignment: [
      { skill: "React", match: 95 },
      { skill: "CSS/Design", match: 92 },
      { skill: "JavaScript", match: 90 },
      { skill: "Collaboration", match: 85 },
    ],
    description: "Join our design-focused team to build beautiful interfaces. Work closely with designers.",
    role: "Frontend Intern",
    roleCategory: "Intern",
  },
  {
    id: "j6",
    title: "SDE-1 Backend Engineer",
    company: "DataFlow Inc",
    location: "Hyderabad",
    type: "Full-time",
    salary: "14-20 LPA",
    match: 62,
    priority: false,
    priorityEnds: null,
    posted: "4 days ago",
    tags: ["Java", "Spring Boot", "Kafka", "MySQL"],
    skillAlignment: [
      { skill: "Java/Spring", match: 40 },
      { skill: "DSA", match: 85 },
      { skill: "Databases", match: 72 },
      { skill: "System Design", match: 48 },
    ],
    description: "Build high-performance backend systems processing millions of events daily.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j7",
    title: "AI/ML Intern",
    company: "DeepTech AI",
    location: "Delhi",
    type: "Internship",
    salary: "45K/month",
    match: 55,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["Python", "TensorFlow", "NLP", "Data Analysis"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "ML Frameworks", match: 35 },
      { skill: "Math/Stats", match: 50 },
      { skill: "Data Pipelines", match: 40 },
    ],
    description: "Work on cutting-edge NLP models and help build our AI product pipeline.",
    role: "AI/ML Intern",
    roleCategory: "Intern",
  },
  {
    id: "j8",
    title: "DevOps Engineer - Fresher",
    company: "ScaleUp",
    location: "Pune",
    type: "Full-time",
    salary: "10-14 LPA",
    match: 48,
    priority: false,
    priorityEnds: null,
    posted: "6 days ago",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    skillAlignment: [
      { skill: "Cloud/AWS", match: 30 },
      { skill: "Containers", match: 35 },
      { skill: "CI/CD", match: 42 },
      { skill: "Scripting", match: 65 },
    ],
    description: "Help us build and maintain scalable infrastructure. Great for learning DevOps from scratch.",
    role: "DevOps Engineer",
    roleCategory: "Fresher",
  },
  {
    id: "j9",
    title: "UI/UX Designer Intern",
    company: "CreativeStudio",
    location: "Remote",
    type: "Internship",
    salary: "30K/month",
    match: 42,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["Figma", "User Research", "Prototyping", "Design Systems"],
    skillAlignment: [
      { skill: "Figma", match: 55 },
      { skill: "Design Thinking", match: 40 },
      { skill: "Prototyping", match: 35 },
      { skill: "Visual Design", match: 45 },
    ],
    description: "Design intuitive user experiences for our SaaS products. Mentorship by senior designers.",
    role: "UI/UX Intern",
    roleCategory: "Intern",
  },
  {
    id: "j10",
    title: "Data Scientist",
    company: "AnalyticsPro",
    location: "Bangalore",
    type: "Full-time",
    salary: "15-22 LPA",
    match: 38,
    priority: false,
    priorityEnds: null,
    posted: "1 week ago",
    tags: ["Python", "SQL", "Machine Learning", "Tableau"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "SQL/Data", match: 45 },
      { skill: "ML Models", match: 25 },
      { skill: "Visualization", match: 30 },
    ],
    description: "Drive data-informed decisions with statistical analysis and predictive models.",
    role: "Data Scientist",
    roleCategory: "SDE-1",
  },
  {
    id: "j11",
    title: "SDE-1 React Native Developer",
    company: "MobiFirst",
    location: "Bangalore",
    type: "Full-time",
    salary: "14-19 LPA",
    match: 85,
    priority: true,
    priorityEnds: "3h 45m",
    posted: "1 day ago",
    tags: ["React Native", "TypeScript", "Redux", "Firebase"],
    skillAlignment: [
      { skill: "React/RN", match: 93 },
      { skill: "TypeScript", match: 90 },
      { skill: "State Mgmt", match: 82 },
      { skill: "Mobile", match: 75 },
    ],
    description: "Build cross-platform mobile experiences for 2M+ users. Strong React background translates directly.",
    role: "Frontend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j12",
    title: "QA Automation Intern",
    company: "TestWise",
    location: "Remote",
    type: "Internship",
    salary: "25K/month",
    match: 58,
    priority: false,
    priorityEnds: null,
    posted: "4 days ago",
    tags: ["Selenium", "JavaScript", "CI/CD", "Jest"],
    skillAlignment: [
      { skill: "JavaScript", match: 88 },
      { skill: "Testing Tools", match: 42 },
      { skill: "CI/CD", match: 38 },
      { skill: "Automation", match: 50 },
    ],
    description: "Automate end-to-end test suites for our fintech platform. Learn industry QA best practices.",
    role: "QA Intern",
    roleCategory: "Intern",
  },
  {
    id: "j13",
    title: "Fresher - Mobile Developer",
    company: "AppNova",
    location: "Chennai",
    type: "Full-time",
    salary: "6-10 LPA",
    match: 64,
    priority: false,
    priorityEnds: null,
    posted: "5 days ago",
    tags: ["Flutter", "Dart", "Firebase", "REST APIs"],
    skillAlignment: [
      { skill: "Flutter/Dart", match: 35 },
      { skill: "Mobile UI", match: 60 },
      { skill: "APIs", match: 82 },
      { skill: "State Mgmt", match: 70 },
    ],
    description: "Join a fast-growing team building Flutter apps for healthcare. Training provided for Flutter newcomers.",
    role: "Mobile Developer",
    roleCategory: "Fresher",
  },
  {
    id: "j14",
    title: "SDE-1 Platform Engineer",
    company: "Infra.io",
    location: "Hyderabad",
    type: "Full-time",
    salary: "16-24 LPA",
    match: 52,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["Go", "Kubernetes", "Terraform", "gRPC"],
    skillAlignment: [
      { skill: "Go", match: 28 },
      { skill: "Kubernetes", match: 35 },
      { skill: "Infra-as-Code", match: 42 },
      { skill: "System Design", match: 65 },
    ],
    description: "Build developer tooling and internal platforms powering 50+ microservices.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j15",
    title: "Data Engineering Intern",
    company: "PipelineHQ",
    location: "Pune",
    type: "Internship",
    salary: "35K/month",
    match: 50,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["Python", "Apache Spark", "SQL", "Airflow"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "SQL", match: 60 },
      { skill: "Spark/ETL", match: 28 },
      { skill: "Data Modeling", match: 35 },
    ],
    description: "Process terabytes of data daily. Work with modern data stack and learn ETL pipelines from scratch.",
    role: "Data Engineering Intern",
    roleCategory: "Intern",
  },
  {
    id: "j16",
    title: "SDE-1 Security Engineer",
    company: "CyberShield",
    location: "Remote",
    type: "Full-time",
    salary: "18-26 LPA",
    match: 35,
    priority: false,
    priorityEnds: null,
    posted: "1 week ago",
    tags: ["Python", "Network Security", "OWASP", "Penetration Testing"],
    skillAlignment: [
      { skill: "Security Concepts", match: 22 },
      { skill: "Python", match: 72 },
      { skill: "Networking", match: 30 },
      { skill: "Pen Testing", match: 15 },
    ],
    description: "Protect critical infrastructure from cyber threats. OSCP certification path supported.",
    role: "Security Engineer",
    roleCategory: "SDE-1",
  },
  {
    id: "j17",
    title: "Fresher - Technical Writer",
    company: "DocuStream",
    location: "Remote",
    type: "Full-time",
    salary: "6-9 LPA",
    match: 60,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["Markdown", "API Docs", "Technical Writing", "Git"],
    skillAlignment: [
      { skill: "Writing", match: 65 },
      { skill: "Git/Tools", match: 80 },
      { skill: "API Knowledge", match: 70 },
      { skill: "Info Architecture", match: 40 },
    ],
    description: "Create developer documentation for open-source tools used by 100K+ developers worldwide.",
    role: "Technical Writer",
    roleCategory: "Fresher",
  },
  {
    id: "j18",
    title: "SDE Intern - Compiler Engineering",
    company: "LangTech",
    location: "Bangalore",
    type: "Internship",
    salary: "50K/month",
    match: 44,
    priority: false,
    priorityEnds: null,
    posted: "6 days ago",
    tags: ["C++", "LLVM", "Compilers", "Algorithms"],
    skillAlignment: [
      { skill: "C++", match: 40 },
      { skill: "Compilers", match: 20 },
      { skill: "Algorithms", match: 78 },
      { skill: "Low-level Systems", match: 32 },
    ],
    description: "Work on next-gen programming language toolchains. Ideal for systems programming enthusiasts.",
    role: "Systems Intern",
    roleCategory: "Intern",
  },
  {
    id: "j19",
    title: "SDE-1 Payments Engineer",
    company: "FinPay",
    location: "Mumbai",
    type: "Full-time",
    salary: "16-22 LPA",
    match: 70,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["Java", "Microservices", "PostgreSQL", "Kafka"],
    skillAlignment: [
      { skill: "Java", match: 55 },
      { skill: "Microservices", match: 62 },
      { skill: "Databases", match: 78 },
      { skill: "Async Systems", match: 72 },
    ],
    description: "Build reliable payment infrastructure handling ₹500Cr+ monthly transactions.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j20",
    title: "Fresher - Growth Engineer",
    company: "GrowthLoop",
    location: "Delhi",
    type: "Full-time",
    salary: "8-12 LPA",
    match: 72,
    priority: false,
    priorityEnds: null,
    posted: "1 day ago",
    tags: ["JavaScript", "A/B Testing", "Analytics", "React"],
    skillAlignment: [
      { skill: "JavaScript/React", match: 92 },
      { skill: "Analytics", match: 55 },
      { skill: "Experimentation", match: 48 },
      { skill: "SQL", match: 65 },
    ],
    description: "Drive product growth through experiments and data-driven feature development. Fast-paced startup culture.",
    role: "Full Stack Developer",
    roleCategory: "Fresher",
  },
  {
    id: "j21",
    title: "SDE-1 Cloud Engineer",
    company: "NimbusCloud",
    location: "Bangalore",
    type: "Full-time",
    salary: "16-23 LPA",
    match: 56,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["AWS", "Terraform", "Python", "Serverless"],
    skillAlignment: [
      { skill: "Cloud/AWS", match: 45 },
      { skill: "IaC/Terraform", match: 38 },
      { skill: "Python", match: 72 },
      { skill: "Serverless", match: 52 },
    ],
    description: "Design and manage cloud infrastructure for enterprise clients. AWS certifications encouraged.",
    role: "DevOps Engineer",
    roleCategory: "SDE-1",
  },
  {
    id: "j22",
    title: "Blockchain Developer Intern",
    company: "Web3Labs",
    location: "Remote",
    type: "Internship",
    salary: "50K/month",
    match: 40,
    priority: false,
    priorityEnds: null,
    posted: "5 days ago",
    tags: ["Solidity", "Ethereum", "Web3.js", "Smart Contracts"],
    skillAlignment: [
      { skill: "Solidity", match: 15 },
      { skill: "JavaScript", match: 88 },
      { skill: "Cryptography", match: 25 },
      { skill: "DApp Architecture", match: 30 },
    ],
    description: "Build decentralized applications on Ethereum. Great intro to blockchain for web developers.",
    role: "Blockchain Intern",
    roleCategory: "Intern",
  },
  {
    id: "j23",
    title: "Fresher - Embedded Systems Engineer",
    company: "IoTech Solutions",
    location: "Chennai",
    type: "Full-time",
    salary: "7-11 LPA",
    match: 33,
    priority: false,
    priorityEnds: null,
    posted: "1 week ago",
    tags: ["C", "RTOS", "ARM", "Embedded Linux"],
    skillAlignment: [
      { skill: "C Programming", match: 42 },
      { skill: "RTOS", match: 18 },
      { skill: "Hardware Interfacing", match: 22 },
      { skill: "Debugging", match: 48 },
    ],
    description: "Develop firmware for next-gen IoT devices. Training program for CS grads entering embedded world.",
    role: "Embedded Engineer",
    roleCategory: "Fresher",
  },
  {
    id: "j24",
    title: "SDE-1 Search Engineer",
    company: "FindFast",
    location: "Hyderabad",
    type: "Full-time",
    salary: "18-25 LPA",
    match: 68,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["Elasticsearch", "Python", "NLP", "Distributed Systems"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "Search/IR", match: 45 },
      { skill: "NLP Basics", match: 55 },
      { skill: "Distributed Sys", match: 62 },
    ],
    description: "Build search experiences serving 10M+ queries daily. Blend of backend and ML.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j25",
    title: "Product Design Intern",
    company: "PixelCraft",
    location: "Mumbai",
    type: "Internship",
    salary: "28K/month",
    match: 47,
    priority: false,
    priorityEnds: null,
    posted: "4 days ago",
    tags: ["Figma", "Wireframing", "Design Systems", "Accessibility"],
    skillAlignment: [
      { skill: "Figma", match: 55 },
      { skill: "Wireframing", match: 42 },
      { skill: "Design Systems", match: 38 },
      { skill: "Accessibility", match: 50 },
    ],
    description: "Shape product experiences for our fintech app used by 5M+ users. Mentored by senior designers.",
    role: "UI/UX Intern",
    roleCategory: "Intern",
  },
  {
    id: "j26",
    title: "SDE-1 Video Streaming Engineer",
    company: "StreamX",
    location: "Remote",
    type: "Full-time",
    salary: "20-28 LPA",
    match: 59,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["Go", "FFmpeg", "WebRTC", "CDN"],
    skillAlignment: [
      { skill: "Go", match: 30 },
      { skill: "Streaming Protocols", match: 25 },
      { skill: "System Design", match: 65 },
      { skill: "Networking", match: 58 },
    ],
    description: "Build low-latency video infrastructure powering live streaming for creators worldwide.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j27",
    title: "Fresher - Site Reliability Engineer",
    company: "UptimeHQ",
    location: "Pune",
    type: "Full-time",
    salary: "10-15 LPA",
    match: 54,
    priority: false,
    priorityEnds: null,
    posted: "5 days ago",
    tags: ["Linux", "Python", "Prometheus", "Grafana"],
    skillAlignment: [
      { skill: "Linux/Systems", match: 50 },
      { skill: "Monitoring", match: 35 },
      { skill: "Python/Scripting", match: 72 },
      { skill: "Incident Mgmt", match: 45 },
    ],
    description: "Keep critical services running at 99.99% uptime. Rotational on-call with experienced SRE mentors.",
    role: "DevOps Engineer",
    roleCategory: "Fresher",
  },
  {
    id: "j28",
    title: "Game Developer Intern",
    company: "PlayForge Studios",
    location: "Bangalore",
    type: "Internship",
    salary: "30K/month",
    match: 36,
    priority: false,
    priorityEnds: null,
    posted: "6 days ago",
    tags: ["Unity", "C#", "Game Physics", "3D Math"],
    skillAlignment: [
      { skill: "C#/Unity", match: 20 },
      { skill: "Game Physics", match: 18 },
      { skill: "3D Math", match: 35 },
      { skill: "Problem Solving", match: 82 },
    ],
    description: "Create mobile games played by millions. Strong problem-solving skills valued over Unity experience.",
    role: "Game Dev Intern",
    roleCategory: "Intern",
  },
  {
    id: "j29",
    title: "SDE-1 API Platform Engineer",
    company: "APIGateway",
    location: "Delhi",
    type: "Full-time",
    salary: "14-20 LPA",
    match: 76,
    priority: true,
    priorityEnds: "4h 10m",
    posted: "1 day ago",
    tags: ["Node.js", "GraphQL", "TypeScript", "Redis"],
    skillAlignment: [
      { skill: "Node.js/TS", match: 88 },
      { skill: "GraphQL", match: 62 },
      { skill: "Caching/Redis", match: 58 },
      { skill: "API Design", match: 80 },
    ],
    description: "Build the API platform serving 500+ enterprise clients. TypeScript-first architecture.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j30",
    title: "Fresher - Analytics Engineer",
    company: "InsightIQ",
    location: "Bangalore",
    type: "Full-time",
    salary: "9-13 LPA",
    match: 66,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["SQL", "dbt", "Python", "Looker"],
    skillAlignment: [
      { skill: "SQL", match: 68 },
      { skill: "Python", match: 72 },
      { skill: "Data Modeling", match: 48 },
      { skill: "BI Tools", match: 55 },
    ],
    description: "Transform raw data into actionable insights. Bridge the gap between data engineering and business teams.",
    role: "Data Scientist",
    roleCategory: "Fresher",
  },
  {
    id: "j31",
    title: "SDE-1 GraphQL Engineer",
    company: "APIFirst Tech",
    location: "Remote",
    type: "Full-time",
    salary: "15-21 LPA",
    match: 81,
    priority: false,
    priorityEnds: null,
    posted: "1 day ago",
    tags: ["GraphQL", "Node.js", "TypeScript", "Apollo"],
    skillAlignment: [
      { skill: "GraphQL", match: 75 },
      { skill: "Node.js/TS", match: 90 },
      { skill: "API Design", match: 85 },
      { skill: "Caching", match: 72 },
    ],
    description: "Design and optimize GraphQL APIs serving millions of queries. Strong TypeScript background required.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j32",
    title: "Frontend Accessibility Intern",
    company: "InclusiveWeb",
    location: "Delhi",
    type: "Internship",
    salary: "32K/month",
    match: 67,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["React", "ARIA", "WCAG", "Testing"],
    skillAlignment: [
      { skill: "React", match: 95 },
      { skill: "Accessibility", match: 52 },
      { skill: "Testing", match: 60 },
      { skill: "HTML/CSS", match: 88 },
    ],
    description: "Help build accessible web experiences for users with disabilities. Learn WCAG standards and inclusive design.",
    role: "Frontend Intern",
    roleCategory: "Intern",
  },
  {
    id: "j33",
    title: "Fresher - Customer Success Engineer",
    company: "SupportOS",
    location: "Pune",
    type: "Full-time",
    salary: "7-10 LPA",
    match: 71,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["JavaScript", "APIs", "Customer Support", "Debugging"],
    skillAlignment: [
      { skill: "JavaScript", match: 88 },
      { skill: "APIs", match: 75 },
      { skill: "Communication", match: 65 },
      { skill: "Debugging", match: 70 },
    ],
    description: "Bridge the gap between customers and engineering. Help clients integrate our API platform successfully.",
    role: "Full Stack Developer",
    roleCategory: "Fresher",
  },
  {
    id: "j34",
    title: "SDE-1 Performance Engineer",
    company: "SpeedLabs",
    location: "Bangalore",
    type: "Full-time",
    salary: "17-24 LPA",
    match: 63,
    priority: false,
    priorityEnds: null,
    posted: "4 days ago",
    tags: ["JavaScript", "Performance", "Profiling", "Optimization"],
    skillAlignment: [
      { skill: "JavaScript", match: 88 },
      { skill: "Performance", match: 45 },
      { skill: "Profiling Tools", match: 38 },
      { skill: "System Design", match: 58 },
    ],
    description: "Optimize web applications for speed and efficiency. Work on Core Web Vitals and rendering performance.",
    role: "Frontend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j35",
    title: "VR/AR Developer Intern",
    company: "MetaVerse Studios",
    location: "Hyderabad",
    type: "Internship",
    salary: "45K/month",
    match: 39,
    priority: false,
    priorityEnds: null,
    posted: "5 days ago",
    tags: ["Unity", "C#", "WebXR", "3D Graphics"],
    skillAlignment: [
      { skill: "Unity/C#", match: 22 },
      { skill: "3D Math", match: 35 },
      { skill: "WebXR", match: 18 },
      { skill: "Problem Solving", match: 82 },
    ],
    description: "Build immersive VR/AR experiences for enterprise training. Strong problem-solving skills can overcome tech gaps.",
    role: "Game Dev Intern",
    roleCategory: "Intern",
  },
  {
    id: "j36",
    title: "Fresher - Integration Engineer",
    company: "ConnectHub",
    location: "Remote",
    type: "Full-time",
    salary: "9-14 LPA",
    match: 75,
    priority: false,
    priorityEnds: null,
    posted: "1 day ago",
    tags: ["REST APIs", "OAuth", "Webhooks", "Node.js"],
    skillAlignment: [
      { skill: "APIs", match: 82 },
      { skill: "Node.js", match: 70 },
      { skill: "OAuth/Auth", match: 68 },
      { skill: "Documentation", match: 78 },
    ],
    description: "Build integrations connecting our platform with 100+ third-party services. API-first development approach.",
    role: "Backend Developer",
    roleCategory: "Fresher",
  },
  {
    id: "j37",
    title: "SDE-1 E-commerce Engineer",
    company: "ShopFlow",
    location: "Mumbai",
    type: "Full-time",
    salary: "14-19 LPA",
    match: 79,
    priority: true,
    priorityEnds: "6h 20m",
    posted: "1 day ago",
    tags: ["React", "Node.js", "Payment Gateway", "Redis"],
    skillAlignment: [
      { skill: "React", match: 95 },
      { skill: "Node.js", match: 68 },
      { skill: "Payments", match: 55 },
      { skill: "Caching", match: 70 },
    ],
    description: "Build high-conversion e-commerce features. Work on checkout, payments, and personalization systems.",
    role: "Full Stack Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j38",
    title: "ML Engineering Intern",
    company: "VisionAI",
    location: "Bangalore",
    type: "Internship",
    salary: "48K/month",
    match: 53,
    priority: false,
    priorityEnds: null,
    posted: "3 days ago",
    tags: ["Python", "PyTorch", "Computer Vision", "OpenCV"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "PyTorch", match: 28 },
      { skill: "Computer Vision", match: 35 },
      { skill: "Math", match: 50 },
    ],
    description: "Train and deploy computer vision models for retail analytics. Hands-on ML experience in production.",
    role: "AI/ML Intern",
    roleCategory: "Intern",
  },
  {
    id: "j39",
    title: "SDE-1 WebAssembly Engineer",
    company: "WasmCore",
    location: "Remote",
    type: "Full-time",
    salary: "18-26 LPA",
    match: 57,
    priority: false,
    priorityEnds: null,
    posted: "4 days ago",
    tags: ["Rust", "WebAssembly", "C++", "Performance"],
    skillAlignment: [
      { skill: "Rust", match: 25 },
      { skill: "Wasm", match: 30 },
      { skill: "C++", match: 42 },
      { skill: "Algorithms", match: 80 },
    ],
    description: "Compile high-performance modules to WebAssembly. Work on cutting-edge browser technology.",
    role: "Backend Developer",
    roleCategory: "SDE-1",
  },
  {
    id: "j40",
    title: "Fresher - Automation Engineer",
    company: "TestFlow",
    location: "Chennai",
    type: "Full-time",
    salary: "8-12 LPA",
    match: 73,
    priority: false,
    priorityEnds: null,
    posted: "2 days ago",
    tags: ["Python", "Selenium", "Playwright", "CI/CD"],
    skillAlignment: [
      { skill: "Python", match: 72 },
      { skill: "Selenium", match: 60 },
      { skill: "Test Design", match: 68 },
      { skill: "CI/CD", match: 65 },
    ],
    description: "Automate testing for web and mobile apps. Build frameworks that ensure product quality at scale.",
    role: "QA Intern",
    roleCategory: "Fresher",
  },
];

const allRoleFilters = ["All", "SDE-1", "Intern", "Fresher", "Frontend Developer", "Backend Developer", "Full Stack Developer", "AI/ML Intern", "DevOps Engineer", "UI/UX Intern", "Data Scientist"];

function JobCard({
  job,
  isApplied,
  isExpanded,
  onToggleExpand,
  onApply,
  showGap,
  preferredRoles,
  showMatchingTags,
}: {
  job: typeof allJobs[0];
  isApplied: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApply: () => void;
  showGap?: boolean;
  preferredRoles?: string[];
  showMatchingTags?: boolean;
}) {
  const avgMatch = Math.round(job.skillAlignment.reduce((a, b) => a + b.match, 0) / job.skillAlignment.length);
  const weakSkills = job.skillAlignment.filter((s) => s.match < 60);

  // Determine matching status for tags
  const isMatchedBySkills = job.match >= 70;
  const isPreferredRole = preferredRoles?.includes(job.role) || false;
  const showMatchedTag = showMatchingTags && isMatchedBySkills && isPreferredRole;
  const showEligibleTag = showMatchingTags && isMatchedBySkills && !isPreferredRole;
  // Priority only shows when the job is also Matched (≥70% + preferred role)
  const showPriority = job.priority && isMatchedBySkills && isPreferredRole;
  // Not Eligible tag for jobs that don't meet basic criteria
  const showNotEligibleTag = showMatchingTags && !isMatchedBySkills && !isApplied;

  return (
    <Card
      hover
      className={`cursor-pointer ${showPriority ? "!border-indigo-200 !bg-indigo-50/20" : ""}`}
    >
      <div onClick={onToggleExpand}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-gray-900">{job.title}</h3>
                {showPriority && (
                  <Badge variant="priority">
                    <Zap className="w-3 h-3 mr-1" /> Priority
                  </Badge>
                )}
                {showMatchedTag && (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Matched
                  </Badge>
                )}
                {showEligibleTag && (
                  <Badge variant="info">
                    <Target className="w-3 h-3 mr-1" /> Eligible
                  </Badge>
                )}
                {showNotEligibleTag && (
                  <Badge variant="neutral">
                    <AlertCircle className="w-3 h-3 mr-1" /> Not Eligible
                  </Badge>
                )}
                {isApplied && (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Applied
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {job.posted}
                </span>
              </div>
            </div>
          </div>
          <MatchScoreCircle score={job.match} size={56} />
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {job.tags.map((t) => (
            <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {t}
            </span>
          ))}
          <span className="text-xs text-gray-500 ml-2">{job.type} · {job.salary}</span>
        </div>

        {showPriority && job.priorityEnds && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg w-fit mb-3">
            <Zap className="w-3 h-3" />
            Priority window closes in {job.priorityEnds}
          </div>
        )}

        {/* Show skill gap hint for low-match jobs in All Jobs */}
        {showGap && weakSkills.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/70 px-3 py-1.5 rounded-lg w-fit mb-2">
            <TrendingUp className="w-3 h-3" />
            Improve {weakSkills.map((s) => s.skill).join(", ")} to boost your match
          </div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-4">{job.description}</p>

              <h4 className="text-sm text-gray-900 mb-3">Skill Alignment</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {job.skillAlignment.map((s) => (
                  <div key={s.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">{s.skill}</span>
                      <span className="text-xs text-gray-500">{s.match}%</span>
                    </div>
                    <ProgressBar
                      value={s.match}
                      color={s.match >= 80 ? "emerald" : s.match >= 60 ? "indigo" : "amber"}
                      size="sm"
                    />
                  </div>
                ))}
              </div>

              {/* Improvement tips for lower match jobs */}
              {weakSkills.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">How to improve your match</span>
                  </div>
                  <ul className="space-y-1">
                    {weakSkills.map((s) => (
                      <li key={s.skill} className="text-xs text-blue-700 flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-blue-400 rounded-full" />
                        Strengthen <span className="text-blue-900">{s.skill}</span> — currently at {s.match}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!isApplied ? (
                <div className="flex items-center gap-3">
                  <GradientButton size="sm" onClick={onApply}>
                    Apply Now <ArrowRight className="w-4 h-4 inline ml-1" />
                  </GradientButton>
                  <GradientButton variant="outline" size="sm">
                    <Star className="w-4 h-4 inline mr-1" /> Save
                  </GradientButton>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Application submitted successfully
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function JobMatches() {
  const { appliedJobs, addAppliedJob, preferredRoles } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allJobsRoleFilter, setAllJobsRoleFilter] = useState("All");
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"matches" | "all">("matches");
  const [includeNotMatched, setIncludeNotMatched] = useState(false);

  // Helper: determine if a job has any visible tag
  // Priority only counts as a tag when the job is also Matched (≥70% + preferred role)
  const jobHasTag = (j: typeof allJobs[0]) => {
    const isMatched = j.match >= 70 && preferredRoles.includes(j.role);
    const isEligible = j.match >= 70 && !preferredRoles.includes(j.role);
    const isApplied = appliedJobs.includes(j.id);
    const hasPriority = j.priority && isMatched; // Priority only valid with Matched
    const isNotEligible = j.match < 70 && !isApplied; // Not eligible if match < 70% and not applied
    return hasPriority || isMatched || isEligible || isApplied || (includeNotMatched && isNotEligible);
  };

  // Job Matches: only jobs with "Matched" tag (≥70% + preferred role)
  // Priority is a bonus tag on matched jobs, not a standalone qualifier
  const matchedJobs = preferredRoles.length > 0
    ? allJobs
        .filter((j) => {
          const isMatched = j.match >= 70 && preferredRoles.includes(j.role);
          return isMatched;
        })
        .sort((a, b) => b.match - a.match)
    : [];

  // All Jobs: everything with at least one tag, plus search/role/threshold filters
  const filteredAllJobs = allJobs
    .filter((j) => {
      if (allJobsRoleFilter !== "All" && j.role !== allJobsRoleFilter && j.roleCategory !== allJobsRoleFilter) return false;
      if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
      // When "Include Not Matched" is ON, show all jobs with tags (including "Not Eligible")
      // When OFF, only show jobs with match >= 70% or applied
      if (!includeNotMatched && j.match < 70 && !appliedJobs.includes(j.id)) return false;
      return true;
    })
    .sort((a, b) => b.match - a.match);

  // Unique roles for filter chips in All Jobs
  const uniqueRoles = ["All", ...Array.from(new Set(allJobs.map((j) => j.role)))];

  const handleApply = (jobId: string) => {
    addAppliedJob(jobId);
    setShowApplyModal(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("matches")}
          className={`px-5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
            activeTab === "matches"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Target className="w-4 h-4 inline mr-1.5" />
          Job Matches
          {matchedJobs.length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
              {matchedJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-2 rounded-lg text-sm transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-1.5" />
          All Jobs
          <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
            {allJobs.length}
          </span>
        </button>
      </div>

      {/* ===== JOB MATCHES TAB ===== */}
      {activeTab === "matches" && (
        <div className="space-y-5">
          {preferredRoles.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-gray-900 mb-2">No preferred roles selected</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                  Go to your Dashboard and select up to 2 preferred roles to see matched jobs here. Only jobs matching your preferred roles appear in this section.
                </p>
                <GradientButton size="sm" onClick={() => navigate("/student")}>
                  Go to Dashboard
                </GradientButton>
              </div>
            </Card>
          ) : (
            <>
              {/* Preferred roles filter info */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-indigo-600">
                  <Target className="w-4 h-4" />
                  Matching roles:
                </div>
                {preferredRoles.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">
                    <Sparkles className="w-3 h-3" /> {r}
                  </span>
                ))}
              </div>

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="text-gray-900">{matchedJobs.length}</span> jobs matching your preferred roles
                </p>
              </div>

              <div className="space-y-4">
                {matchedJobs.map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <JobCard
                      job={job}
                      isApplied={appliedJobs.includes(job.id)}
                      isExpanded={expandedJob === job.id}
                      onToggleExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      onApply={() => setShowApplyModal(job.id)}
                      preferredRoles={preferredRoles}
                      showMatchingTags={true}
                    />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ALL JOBS TAB ===== */}
      {activeTab === "all" && (
        <div className="space-y-5">
          {/* Info callout */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              Browse all available positions including roles outside your preferred selection. Use this to discover opportunities and understand what skills to build for future roles.
            </p>
          </div>

          {/* Search + role filter */}
          <Card className="!p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs or companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {uniqueRoles.map((f) => (
                  <button
                    key={f}
                    onClick={() => setAllJobsRoleFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      allJobsRoleFilter === f
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-gray-900">{filteredAllJobs.length}</span> positions sorted by relevance
            </p>
            <div className="flex items-center gap-4">
              {/* Include Not Matched Toggle */}
              <button
                onClick={() => setIncludeNotMatched(!includeNotMatched)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  includeNotMatched
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {includeNotMatched ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>Include Not Matched</span>
              </button>
              
              {/* Sort dropdown */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Sort by Match %</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {filteredAllJobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <JobCard
                  job={job}
                  isApplied={appliedJobs.includes(job.id)}
                  isExpanded={expandedJob === job.id}
                  onToggleExpand={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  onApply={() => setShowApplyModal(job.id)}
                  preferredRoles={preferredRoles}
                  showMatchingTags={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Apply confirmation modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Confirm Application</h3>
                <button onClick={() => setShowApplyModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                You're applying to <span className="text-gray-900">{allJobs.find((j) => j.id === showApplyModal)?.title}</span>{" "}
                at <span className="text-gray-900">{allJobs.find((j) => j.id === showApplyModal)?.company}</span>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your verified skill profile will be shared with the recruiter.
              </p>
              <div className="flex gap-3">
                <GradientButton className="flex-1" onClick={() => handleApply(showApplyModal)}>
                  <CheckCircle2 className="w-4 h-4 inline mr-1" /> Confirm & Apply
                </GradientButton>
                <GradientButton variant="outline" onClick={() => setShowApplyModal(null)}>
                  Cancel
                </GradientButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}