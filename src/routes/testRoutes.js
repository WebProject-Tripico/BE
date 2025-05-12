const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// 이동시간 계산 함수 (예시)
function calculateTravelTime(fromLat, fromLng, toLat, toLng) {
  // 여기에 실제 이동시간 계산 로직 구현
  // 예: Google Maps API, Naver Maps API 등 사용
  
  // 테스트용 더미 데이터
  return {
    distance: "10.5 km",
    duration: "25분"
  };
}

// 데이터베이스의 관광지로 테스트
router.get("/test-tourist-spots", async (req, res) => {
  try {
    // 데이터베이스에서 관광지 정보 가져오기
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE latitude != 0 AND longitude != 0 LIMIT 10"
    );

    if (!spots || spots.length === 0) {
      return res.status(404).json({
        success: false,
        error: "관광지 데이터가 없습니다."
      });
    }

    const results = [];
    for (let i = 0; i < spots.length - 1; i++) {
      const from = spots[i];
      const to = spots[i + 1];
      
      const travelTime = calculateTravelTime(
        from.latitude,
        from.longitude,
        to.latitude,
        to.longitude
      );
      
      results.push({
        from: {
          id: from.content_id,
          name: from.name,
          lat: from.latitude,
          lng: from.longitude
        },
        to: {
          id: to.content_id,
          name: to.name,
          lat: to.latitude,
          lng: to.longitude
        },
        distance: travelTime.distance,
        duration: travelTime.duration
      });
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('이동시간 계산 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 특정 관광지 간의 이동시간 계산
router.post("/calculate-between-spots", async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    
    if (!fromId || !toId) {
      return res.status(400).json({
        success: false,
        error: "출발지와 도착지 ID가 필요합니다."
      });
    }

    // 데이터베이스에서 두 관광지 정보 가져오기
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE content_id IN (?, ?)",
      [fromId, toId]
    );

    if (spots.length !== 2) {
      return res.status(404).json({
        success: false,
        error: "관광지를 찾을 수 없습니다."
      });
    }

    const from = spots.find(spot => spot.content_id === fromId);
    const to = spots.find(spot => spot.content_id === toId);

    const travelTime = calculateTravelTime(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );

    res.json({
      success: true,
      data: {
        from: {
          id: from.content_id,
          name: from.name,
          lat: from.latitude,
          lng: from.longitude
        },
        to: {
          id: to.content_id,
          name: to.name,
          lat: to.latitude,
          lng: to.longitude
        },
        distance: travelTime.distance,
        duration: travelTime.duration
      }
    });
  } catch (error) {
    console.error('이동시간 계산 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 관광지 목록 가져오기
router.get("/tourist-spots", async (req, res) => {
  try {
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE latitude != 0 AND longitude != 0"
    );

    res.json({
      success: true,
      data: spots
    });
  } catch (error) {
    console.error('관광지 목록 조회 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
