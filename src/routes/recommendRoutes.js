const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

router.post('/recommend', recommendController.recommendCourse);

module.exports = router;