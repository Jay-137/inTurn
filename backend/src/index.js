const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // <-- Add this import
const studentRoutes = require('./routes/studentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const placementRoutes = require('./routes/placementRoutes');
const universityRoutes = require('./routes/universityRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');


const app = express();

app.use(cors());
app.use(express.json());

// Mount the Auth Routes
app.use('/api/auth', authRoutes); // <-- Mount it here
app.use('/api/students', studentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/university', universityRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Placement System API is running.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});