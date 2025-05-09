const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const fetchTourData = require('../scripts/fetchTourData');

// 라우터 임포트
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const touristSpotRoutes = require('./routes/touristSpotRoutes');
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tourist-spots', touristSpotRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/auth', authRoutes);

// 데이터 수집 라우트
app.get("/fetch-gyeongbuk", async (req, res) => {
  await fetchTourData(); // areaCode=35, 경북
  res.send("✅ 경상북도 관광지 저장 완료!");
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 데이터베이스 연결 테스트
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