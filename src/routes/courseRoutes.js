const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourse);
router.get('/user/:user_id', courseController.getUserCourses);
router.get('/:id', courseController.getCourseById);

router.post('/:course_id/items', courseController.addTripItem);
router.put('/:course_id/items/:item_id', courseController.updateTripItem);
router.delete('/:course_id/items/:item_id', courseController.deleteTripItem);

router.post('/:user_id/recommend', courseController.recommendCourse);

router.get('/', (req, res) => {
  res.json({ message: '코스 목록 조회' });
});

router.get('/:id', (req, res) => {
  res.json({ message: '코스 상세 정보 조회' });
});

router.post('/:user_id/recommend', (req, res) => {
  res.json({ message: '코스 추천' });
});

module.exports = router; 