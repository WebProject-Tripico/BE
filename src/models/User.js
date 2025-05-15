const { promisePool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    try {
      const [rows] = await promisePool.execute('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await promisePool.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { id, password, name } = userData;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [result] = await promisePool.execute(
        'INSERT INTO users (id, password, name, created_at) VALUES (?, ?, ?, NOW())',
        [id, hashedPassword, name]
      );
      
      return { id, name };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 