require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  dbConfig: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trip_db'
  },
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  tourApiKey: process.env.TOUR_API_KEY
}; 