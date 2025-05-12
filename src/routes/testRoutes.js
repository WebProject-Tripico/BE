const express = require("express");
const router = express.Router();
const { promisePool } = require("../config/database");

function calculateTravelTime(fromLat, fromLng, toLat, toLng) {
  return {
    distance: "10.5 km",
    duration: "25분",
  };
}

router.get("/test-tourist-spots", async (req, res) => {
  try {
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE latitude != 0 AND longitude != 0 LIMIT 10"
    );

    if (!spots || spots.length === 0) {
      return res.status(404).json({
        success: false,
        error: "관광지 데이터가 없습니다.",
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
          lng: from.longitude,
        },
        to: {
          id: to.content_id,
          name: to.name,
          lat: to.latitude,
          lng: to.longitude,
        },
        distance: travelTime.distance,
        duration: travelTime.duration,
      });
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("이동시간 계산 실패:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/calculate-between-spots", async (req, res) => {
  try {
    const { fromId, toId } = req.body;

    if (!fromId || !toId) {
      return res.status(400).json({
        success: false,
        error: "출발지와 도착지 ID가 필요합니다.",
      });
    }
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE content_id IN (?, ?)",
      [fromId, toId]
    );

    if (spots.length !== 2) {
      return res.status(404).json({
        success: false,
        error: "관광지를 찾을 수 없습니다.",
      });
    }

    const from = spots.find((spot) => spot.content_id === fromId);
    const to = spots.find((spot) => spot.content_id === toId);

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
          lng: from.longitude,
        },
        to: {
          id: to.content_id,
          name: to.name,
          lat: to.latitude,
          lng: to.longitude,
        },
        distance: travelTime.distance,
        duration: travelTime.duration,
      },
    });
  } catch (error) {
    console.error("이동시간 계산 실패:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/tourist-spots", async (req, res) => {
  try {
    const [spots] = await promisePool.query(
      "SELECT content_id, name, latitude, longitude FROM tourist_spots WHERE latitude != 0 AND longitude != 0"
    );

    res.json({
      success: true,
      data: spots,
    });
  } catch (error) {
    console.error("관광지 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
