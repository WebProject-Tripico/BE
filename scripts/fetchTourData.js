const axios = require("axios");
const pool = require("../src/config/database");
require("dotenv").config();

async function fetchTourData(areaCode = 35, contentTypeId = 12) {
  const apiKey = process.env.TOUR_API_KEY;
  const numOfRows = 100;
  let pageNo = 1;
  let totalCount = 0;

  do {
    const listUrl = `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${apiKey}&MobileApp=testApp&MobileOS=ETC&areaCode=${areaCode}&contentTypeId=${contentTypeId}&numOfRows=${numOfRows}&pageNo=${pageNo}&arrange=A&_type=json`;

    try {
      const res = await axios.get(listUrl);
      const body = res.data?.response?.body;

      if (!body || !body.items) {
        console.warn(` ${pageNo}페이지 응답 오류. 응답 구조:`, res.data);
        break;
      }

      if (pageNo === 1) {
        totalCount = body.totalCount;
        console.log(` 총 관광지 수: ${totalCount}개`);
      }

      const items = body.items.item || [];
      if (!items.length) break;

      for (const item of items) {
        const contentId = item.contentid;
        const name = item.title || "이름 없음";
        const address = item.addr1 || "";
        const latitude = item.mapy || 0;
        const longitude = item.mapx || 0;
        const createdAt = new Date();

        let description = "설명 없음";
        let imageUrl = "";
        try {
          const overviewUrl = `http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${apiKey}&MobileApp=testApp&MobileOS=ETC&contentId=${contentId}&contentTypeId=${contentTypeId}&overviewYN=Y&defaultYN=Y&firstImageYN=Y&_type=json`;
          const overviewRes = await axios.get(overviewUrl);
          const commonItem = overviewRes.data?.response?.body?.items?.item;

          if (commonItem) {
            description = commonItem.overview || "설명 없음";
            const img1 = commonItem.firstimage || "";
            const img2 = commonItem.firstimage2 || "";
            imageUrl = [img1, img2].filter(Boolean).join("\n");
          }
        } catch (err) {
          console.warn(` ${name} overview 조회 실패: ${err.message}`);
        }

        try {
          const sql = `
            INSERT INTO tourist_spots 
            (name, description, latitude, longitude, address, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              description = VALUES(description),
              image_url = VALUES(image_url)
          `;

          await pool.execute(sql, [
            name,
            description.trim(),
            latitude,
            longitude,
            address,
            imageUrl.trim(),
            createdAt,
          ]);

          console.log(` 저장 완료: ${name}`);
          await new Promise((r) => setTimeout(r, 200));
        } catch (dbErr) {
          console.error(` DB 저장 실패: ${name} - ${dbErr.message}`);
        }
      }

      pageNo++;
    } catch (err) {
      console.error(` ${pageNo}페이지 오류:`, err.message);
      break;
    }
  } while ((pageNo - 1) * numOfRows < totalCount);

  console.log(" 경상북도 관광지 저장 완료!");
}

module.exports = fetchTourData;
