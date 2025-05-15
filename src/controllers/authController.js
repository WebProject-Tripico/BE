const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/tokenUtils");

exports.register = async (req, res) => {
  try {
    const { id, password, name } = req.body;

    if (!id || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "모든 필드를 입력해주세요.",
      });
    }

    const existingUser = await User.findById(id);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "이미 사용 중인 아이디입니다.",
      });
    }

    const user = await User.create({ id, password, name });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다.",
      token,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error("회원가입 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      details: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        success: false,
        message: "아이디와 비밀번호를 입력해주세요.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "아이디 또는 비밀번호가 일치하지 않습니다.",
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "로그인이 완료되었습니다.",
      token,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    console.error("로그인 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      details: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다."
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다."
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "로그아웃이 완료되었습니다."
    });
  } catch (error) {
    console.error("로그아웃 에러:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      details: error.message
    });
  }
};
