const axios = require('axios');

const AI_SERVER_URL = process.env.AI_SERVER_URL || 'http://localhost:5001';

const aiServer = axios.create({
  baseURL: AI_SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = aiServer; 