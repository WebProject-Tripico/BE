const axios = require('axios');

const KAKAO_API_KEY = process.env.KAKAO_API_KEY;

if (!KAKAO_API_KEY) {
  throw new Error('KAKAO_API_KEY 환경변수가 설정되어 있지 않습니다.');
}

exports.getMoveTime = async (from, to, transportation) => {
  try {
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';
    const headers = { Authorization: `KakaoAK ${KAKAO_API_KEY}` };
    const params = {
      origin: `${from.longitude},${from.latitude}`,
      destination: `${to.longitude},${to.latitude}`,
      priority: transportation === 'car' ? 'RECOMMEND' : 'DISTANCE'
    };
    const response = await axios.get(url, { headers, params });
    if (
      response.data &&
      response.data.routes &&
      response.data.routes.length > 0 &&
      response.data.routes[0].summary &&
      typeof response.data.routes[0].summary.duration === 'number'
    ) {
      const duration = response.data.routes[0].summary.duration;
      return Math.ceil(duration / 60);
    } else {
      console.error('카카오 응답 구조 이상:', response.data);
      return null;
    }
  } catch (err) {
    console.error('카카오 이동시간 계산 실패:', err.message);
    return null;
  }
};

exports.addMoveTimes = async (spots, transportation, startPoint) => {
  const results = [];
  let from = startPoint;
  for (const spot of spots) {
    const move_time = await exports.getMoveTime(from, spot, transportation);
    results.push({ ...spot, move_time });
    from = spot; 
  }
  return results;
};