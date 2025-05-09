const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const fetchTourData = require('../scripts/fetchTourData');

const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const touristSpotRoutes = require('./routes/touristSpotRoutes');
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tourist-spots', touristSpotRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/auth', authRoutes);

app.get("/fetch-gyeongbuk", async (req, res) => {
  await fetchTourData();
  res.send("✅ 경상북도 관광지 저장 완료!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 