const pool = require('../config/database');

class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async create(userData) {
    const { email, password, name } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, password, name]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = User; 