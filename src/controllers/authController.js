const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: '24h'
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({
      email,
      password: hashedPassword,
      name
    });

    const token = generateToken(userId);

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = generateToken(user.id);

    res.json({
      message: '로그인이 완료되었습니다.',
      token
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}; 