const express = require("express");
const db = require("../config/database");
const { getCarDuration, getWalkDuration } = require("../../scripts/kakao");
const { getTransitDuration } = require("../../scripts/google");
const router = express.Router();

router.post("/calculate-time", async (req, res) => {
  const { startLat, startLng, placeId, transport } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT latitude, longitude, name FROM tourist_spots WHERE id = ?",
      [placeId]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "목적지 없음" });
    const { latitude, longitude, name } = rows[0];

    let duration = null;
    if (transport === "차량") {
      duration = await getCarDuration(startLat, startLng, latitude, longitude);
    } else if (transport === "도보") {
      duration = await getWalkDuration(startLat, startLng, latitude, longitude);
    } else if (transport === "대중교통") {
      duration = await getTransitDuration(
        startLat,
        startLng,
        latitude,
        longitude
      );
    } else {
      return res.status(400).json({ error: "이동수단 오류" });
    }

    if (duration === null) {
      return res.status(500).json({ error: "이동시간 계산 실패" });
    }

    return res.json({
      destination: name,
      transport,
      duration,
    });
  } catch (err) {
    return res.status(500).json({ error: "서버 오류", detail: err.message });
  }
});

module.exports = router;
