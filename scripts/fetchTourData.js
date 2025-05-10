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

      let items = body.items.item || [];
      // 단일 객체인 경우 배열로 변환
      if (!Array.isArray(items)) {
        items = [items];
      }
      if (!items.length) break;

      for (const item of items) {
        const contentId = item.contentid;
        if (!contentId) {
          console.warn('contentId가 없는 항목이 있습니다:', item);
          continue;
        }

        const name = item.title || "이름 없음";
        const address = item.addr1 || "";
        const latitude = item.mapy || 0;
        const longitude = item.mapx || 0;
        const createdAt = new Date();

        let description = "데이터가 없습니다";
        let imageUrl = "";
        try {
          const overviewUrl = `http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${apiKey}&MobileApp=testApp&MobileOS=ETC&contentId=${contentId}&contentTypeId=${contentTypeId}&overviewYN=Y&defaultYN=Y&firstImageYN=Y&_type=json`;
          const overviewRes = await axios.get(overviewUrl);
          let commonItem = overviewRes.data?.response?.body?.items?.item;
          if (Array.isArray(commonItem)) {
            commonItem = commonItem[0];
          }

          if (commonItem) {
            const descriptionData = {
              address: address,
              overview: commonItem.overview?.trim() || "데이터가 없습니다",
              expGuide: commonItem.expguide?.trim() || "데이터가 없습니다",
              infoCenter: commonItem.infocenter?.trim() || "데이터가 없습니다",
              useTime: commonItem.usetime?.trim() || "데이터가 없습니다",
              parking: commonItem.parking?.trim() || "데이터가 없습니다",
              babyCarriage: commonItem.chkbabycarriage?.trim() || "데이터가 없습니다",
              creditCard: commonItem.chkcreditcard?.trim() || "데이터가 없습니다"
            };

            description = JSON.stringify(descriptionData);

            let img1 = commonItem.firstimage || "";
            let img2 = commonItem.firstimage2 || "";
            if (!img1 && !img2) {
              imageUrl = "이미지가 없습니다";
            } else {
              imageUrl = [img1, img2].filter(Boolean).join("\n");
            }
          } else {
            description = JSON.stringify({
              address: address,
              overview: "데이터가 없습니다"
            });
          }
        } catch (err) {
          console.warn(` ${name} overview 조회 실패: ${err.message}`);
          description = JSON.stringify({
            address: address,
            overview: "데이터가 없습니다"
          });
        }

        try {
          const sql = `
            INSERT INTO tourist_spots 
            (name, description, latitude, longitude, address, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          const [result] = await pool.execute(sql, [
            name,
            description.trim(),
            latitude,
            longitude,
            address,
            imageUrl.trim(),
            createdAt,
          ]);
          console.log(` 저장 결과: ${name}, affectedRows: ${result.affectedRows}, insertId: ${result.insertId}`);
          await new Promise((r) => setTimeout(r, 200));
        } catch (dbErr) {
          console.error(` DB 저장 실패: ${name} - ${dbErr.message}`);
          continue;
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
