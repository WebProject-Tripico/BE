const aiServer = require('../config/aiServer');

class AIService {
  static async getRecommendations(preferences) {
    try {
      const response = await aiServer.post('/recommend', preferences);
      return response.data;
    } catch (error) {
      console.error('AI 서버 통신 오류:', error);
      throw new Error('AI 추천 서비스에 문제가 발생했습니다.');
    }
  }

  static async analyzeUserPreferences(userId) {
    try {
      const response = await aiServer.get(`/analyze/${userId}`);
      return response.data;
    } catch (error) {
      console.error('AI 서버 통신 오류:', error);
      throw new Error('사용자 선호도 분석에 실패했습니다.');
    }
  }
}

module.exports = AIService; 