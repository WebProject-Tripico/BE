const { pool } = require('../config/database');

class TouristSpot {
  static async create({ name, description, latitude, longitude, address, image_url }) {
    const [result] = await pool.execute(
      'INSERT INTO tourist_spots (name, description, latitude, longitude, address, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, description, latitude, longitude, address, image_url]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM tourist_spots');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM tourist_spots WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByLocation(latitude, longitude, radius) {
    const [rows] = await pool.execute(
      `SELECT *, 
       (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
       FROM tourist_spots 
       HAVING distance < ? 
       ORDER BY distance`,
      [latitude, longitude, latitude, radius]
    );
    return rows;
  }
}

module.exports = TouristSpot; 