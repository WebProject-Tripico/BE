import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 코스 추천 API
export const recommendCourse = async (userId, preferences) => {
  try {
    const response = await api.post(`/courses/${userId}/recommend`, preferences);
    return response.data;
  } catch (error) {
    console.error('코스 추천 요청 실패:', error);
    throw error;
  }
};

// 관광지 목록 조회 API
export const getTouristSpots = async () => {
  try {
    const response = await api.get('/tourist-spots');
    return response.data;
  } catch (error) {
    console.error('관광지 목록 조회 실패:', error);
    throw error;
  }
};

// 사용자 선호도 분석 API
export const analyzePreferences = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/preferences`);
    return response.data;
  } catch (error) {
    console.error('선호도 분석 실패:', error);
    throw error;
  }
};

// 코스 저장 API
export const saveCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    console.error('코스 저장 실패:', error);
    throw error;
  }
};

// 코스 목록 조회 API
export const getCourses = async (userId) => {
  try {
    const response = await api.get(`/courses?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('코스 목록 조회 실패:', error);
    throw error;
  }
};

export default api; 