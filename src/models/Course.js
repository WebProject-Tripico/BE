const { pool } = require('../config/database');

class Course {
  static async create({ user_id, start_date, end_date, number_of_people, recommendation_type }) {
    const [result] = await pool.execute(
      'INSERT INTO trip_courses (user_id, start_date, end_date, number_of_people, recommendation_type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, start_date, end_date, number_of_people, recommendation_type]
    );
    return result.insertId;
  }

  static async addTripItem({ course_id, place_id, day_number, sequence, expected_time }) {
    const [result] = await pool.execute(
      'INSERT INTO trip_items (course_id, place_id, day_number, sequence, expected_time) VALUES (?, ?, ?, ?, ?)',
      [course_id, place_id, day_number, sequence, expected_time]
    );
    return result.insertId;
  }

  static async updateTripItem(item_id, { sequence, expected_time }) {
    const [result] = await pool.execute(
      'UPDATE trip_items SET sequence = ?, expected_time = ? WHERE id = ?',
      [sequence, expected_time, item_id]
    );
    return result.affectedRows > 0;
  }

  static async deleteTripItem(item_id) {
    const [result] = await pool.execute(
      'DELETE FROM trip_items WHERE id = ?',
      [item_id]
    );
    return result.affectedRows > 0;
  }

  static async findByUserId(user_id) {
    const [rows] = await pool.execute(
      `SELECT tc.*, 
       GROUP_CONCAT(ti.place_id) as place_ids,
       GROUP_CONCAT(ti.day_number) as day_numbers,
       GROUP_CONCAT(ti.sequence) as sequences,
       GROUP_CONCAT(ti.expected_time) as expected_times
       FROM trip_courses tc
       LEFT JOIN trip_items ti ON tc.id = ti.course_id
       WHERE tc.user_id = ?
       GROUP BY tc.id`,
      [user_id]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT tc.*, 
       GROUP_CONCAT(ti.place_id) as place_ids,
       GROUP_CONCAT(ti.day_number) as day_numbers,
       GROUP_CONCAT(ti.sequence) as sequences,
       GROUP_CONCAT(ti.expected_time) as expected_times
       FROM trip_courses tc
       LEFT JOIN trip_items ti ON tc.id = ti.course_id
       WHERE tc.id = ?
       GROUP BY tc.id`,
      [id]
    );
    return rows[0];
  }

  static async getTripItems(course_id) {
    const [rows] = await pool.execute(
      `SELECT ti.*, ts.name as place_name, ts.latitude, ts.longitude, ts.address
       FROM trip_items ti
       JOIN tourist_spots ts ON ti.place_id = ts.id
       WHERE ti.course_id = ?
       ORDER BY ti.day_number, ti.sequence`,
      [course_id]
    );
    return rows;
  }
}

module.exports = Course; 