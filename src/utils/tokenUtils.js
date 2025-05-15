const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: '24h'
  });
};

// 토큰 검증
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 토큰에서 사용자 ID 추출
const getUserIdFromToken = (token) => {
  try {
    const decoded = verifyToken(token);
    return decoded.id;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  getUserIdFromToken
}; 