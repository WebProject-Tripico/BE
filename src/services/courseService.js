const Course = require('../models/Course');
const TouristSpot = require('../models/TouristSpot');
const AIService = require('./aiService');

class CourseService {
  static async recommendCourse(preferences) {
    try {
      const aiRecommendations = await AIService.getRecommendations(preferences);
      const recommendedSpots = await TouristSpot.findByIds(aiRecommendations.spotIds);
  
      const course = await Course.create({
        duration: preferences.duration,
        purpose: preferences.purpose,
        group_size: preferences.groupSize,
        spots: recommendedSpots,
        route: null 
      });

      return course;
    } catch (error) {
      console.error('코스 추천 오류:', error);
      throw error;
    }
  }

  static async getSpotsByPurpose(purpose) {
    return await TouristSpot.findByPurpose(purpose);
  }

  static async getCoursesByDuration(duration) {
    return await Course.findByDuration(duration);
  }

  static async getCoursesByGroupSize(groupSize) {
    return await Course.findByGroupSize(groupSize);
  }
}

module.exports = CourseService; 

