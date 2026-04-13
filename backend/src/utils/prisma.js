const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

// Parse the connection string from your .env
const dbUrl = new URL(process.env.DATABASE_URL);

// Initialize the official MariaDB adapter
const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    connectionLimit: 10,
    allowPublicKeyRetrieval: true // <--- Add this line right here
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;