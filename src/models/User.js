const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results[0]);
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(results[0]);
      });
    });
  }

  static async create(userData) {
    const { id, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (id, password, name, created_at) VALUES (?, ?, ?, NOW())';
      db.query(query, [id, hashedPassword, name], (err, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id, name });
      });
    });
  }
}

module.exports = User; 