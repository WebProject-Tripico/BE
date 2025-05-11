const axios = require("axios");
const KAKAO_API_KEY = process.env.KAKAO_API_KEY || "KakaoAK YOUR_KAKAO_KEY";

async function getCarDuration(startLat, startLng, endLat, endLng) {
  const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${startLng},${startLat}&destination=${endLng},${endLat}`;
  try {
    const res = await axios.get(url, {
      headers: { Authorization: KAKAO_API_KEY },
    });
    return Math.round(res.data.routes[0].summary.duration / 60);
  } catch (e) {
    return null;
  }
}

async function getWalkDuration(startLat, startLng, endLat, endLng) {
  const url = `https://apis-navi.kakaomobility.com/v1/walks/directions?origin=${startLng},${startLat}&destination=${endLng},${endLat}`;
  try {
    const res = await axios.get(url, {
      headers: { Authorization: KAKAO_API_KEY },
    });
    return Math.round(res.data.routes[0].summary.duration / 60);
  } catch (e) {
    return null;
  }
}

module.exports = { getCarDuration, getWalkDuration };
