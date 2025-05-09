import React, { useState } from 'react';
import { recommendCourse, analyzePreferences } from '../services/api';

const CourseRecommendation = ({ userId }) => {
  const [preferences, setPreferences] = useState({
    duration: 1, // 일수
    purpose: 'leisure', // 목적 (leisure, experience, culture 등)
    groupSize: 2, // 인원수
    budget: 'medium', // 예산 (low, medium, high)
    transportation: 'car' // 이동수단 (car, public, walk)
  });
  const [recommendedCourse, setRecommendedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 먼저 사용자 선호도 분석
      await analyzePreferences(userId);
      
      // 코스 추천 요청
      const result = await recommendCourse(userId, preferences);
      setRecommendedCourse(result.course);
    } catch (err) {
      setError(err.message || '코스 추천 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-recommendation">
      <h2>맞춤 여행 코스 추천</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>여행 기간 (일)</label>
          <input
            type="number"
            name="duration"
            value={preferences.duration}
            onChange={handlePreferenceChange}
            min="1"
            max="7"
          />
        </div>

        <div className="form-group">
          <label>여행 목적</label>
          <select
            name="purpose"
            value={preferences.purpose}
            onChange={handlePreferenceChange}
          >
            <option value="leisure">휴식</option>
            <option value="experience">체험</option>
            <option value="culture">문화</option>
            <option value="nature">자연</option>
          </select>
        </div>

        <div className="form-group">
          <label>인원수</label>
          <input
            type="number"
            name="groupSize"
            value={preferences.groupSize}
            onChange={handlePreferenceChange}
            min="1"
            max="10"
          />
        </div>

        <div className="form-group">
          <label>예산</label>
          <select
            name="budget"
            value={preferences.budget}
            onChange={handlePreferenceChange}
          >
            <option value="low">저예산</option>
            <option value="medium">중간</option>
            <option value="high">고예산</option>
          </select>
        </div>

        <div className="form-group">
          <label>이동수단</label>
          <select
            name="transportation"
            value={preferences.transportation}
            onChange={handlePreferenceChange}
          >
            <option value="car">자가용</option>
            <option value="public">대중교통</option>
            <option value="walk">도보</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '추천 중...' : '코스 추천받기'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {recommendedCourse && (
        <div className="recommended-course">
          <h3>추천된 코스</h3>
          <div className="course-details">
            {/* 추천된 코스 정보 표시 */}
            <p>총 소요 시간: {recommendedCourse.totalDuration}시간</p>
            <p>예상 비용: {recommendedCourse.estimatedCost}원</p>
            <div className="spots-list">
              {recommendedCourse.spots.map((spot, index) => (
                <div key={spot.id} className="spot-item">
                  <h4>{index + 1}. {spot.name}</h4>
                  <p>{spot.description}</p>
                  <p>소요 시간: {spot.duration}시간</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRecommendation; 