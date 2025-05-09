const User = require('../models/User');
const { validateUserInput } = require('../utils/validators');
const { AppError } = require('../utils/errorHandler');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    validateUserInput({ name, email, password });

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const userId = await User.create({ name, email, password });
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 사용자 찾기
    const user = await User.findByEmail(email);
    if (!user || user.password !== password) {
      throw new AppError('Invalid email or password', 401);
    }

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 