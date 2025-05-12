const axios = require("axios");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_KEY";

async function getTransitDuration(startLat, startLng, endLat, endLng) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&mode=transit&key=${GOOGLE_API_KEY}&language=ko`;
  try {
    const res = await axios.get(url);
    if (res.data.routes.length === 0) return null;
    return Math.round(res.data.routes[0].legs[0].duration.value / 60);
  } catch (e) {
    console.error("구글 대중교통 API 오류:", e.response ? e.response.data : e.message);
    return null;
  }
}

module.exports = { getTransitDuration };
