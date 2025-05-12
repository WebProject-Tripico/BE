const { promisePool } = require("../src/config/database");
const axios = require("axios");
require("dotenv").config();

async function fetchTourData2(areaCode = 35, contentTypeId = 12) {
  const apiKey = process.env.TOUR_API_KEY;
  const numOfRows = 100;
  let pageNo = 11;
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

      if (pageNo === 11) {
        totalCount = body.totalCount;
        console.log(` 총 관광지 수: ${totalCount}개`);
        console.log(` 1003번째 데이터부터 저장 시작`);
      }

      let items = body.items.item || [];
      if (!Array.isArray(items)) {
        items = [items];
      }
      if (!items.length) break;

      for (const item of items) {
        const contentId = item.contentid;
        if (!contentId) {
          console.warn("contentId가 없는 항목이 있습니다:", item);
          continue;
        }

        const name = item.title || "이름 없음";
        const address = item.addr1 || "";
        const latitude = item.mapy || 0;
        const longitude = item.mapx || 0;
        const createdAt = new Date();

        let description = "데이터가 없습니다";
        let imageUrl = item.firstimage || "이미지가 없습니다";

        try {
          const introUrl = `http://apis.data.go.kr/B551011/KorService1/detailIntro1?serviceKey=${apiKey}&MobileApp=testApp&MobileOS=ETC&contentId=${contentId}&contentTypeId=${contentTypeId}&_type=json`;
          const introRes = await axios.get(introUrl);
          let introItem = introRes.data?.response?.body?.items?.item;
          if (Array.isArray(introItem)) {
            introItem = introItem[0];
          }

          const commonUrl = `http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${apiKey}&MobileApp=testApp&MobileOS=ETC&contentId=${contentId}&contentTypeId=${contentTypeId}&defaultYN=Y&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y&_type=json`;
          const commonRes = await axios.get(commonUrl);
          let commonItem = commonRes.data?.response?.body?.items?.item;
          if (Array.isArray(commonItem)) {
            commonItem = commonItem[0];
          }

          if (introItem || commonItem) {
            const descriptionData = {
              heritage1: introItem?.heritage1 || "0",
              heritage2: introItem?.heritage2 || "0",
              heritage3: introItem?.heritage3 || "0",
              infocenter: introItem?.infocenter || "데이터가 없습니다",
              opendate: introItem?.opendate || "데이터가 없습니다",
              restdate: introItem?.restdate || "데이터가 없습니다",
              expguide: introItem?.expguide || "데이터가 없습니다",
              expagerange: introItem?.expagerange || "데이터가 없습니다",
              accomcount: introItem?.accomcount || "데이터가 없습니다",
              useseason: introItem?.useseason || "데이터가 없습니다",
              usetime: introItem?.usetime || "데이터가 없습니다",
              parking: introItem?.parking || "데이터가 없습니다",
              babyCarriage: introItem?.chkbabycarriage || "데이터가 없습니다",
              creditCard: introItem?.chkcreditcard || "데이터가 없습니다",
              pet: introItem?.chkpet || "데이터가 없습니다",
              overview: commonItem?.overview || "데이터가 없습니다",
            };

            console.log(
              ` ${name} 상세정보:`,
              JSON.stringify(descriptionData, null, 2)
            );
            description = JSON.stringify(descriptionData);
          } else {
            console.warn(` ${name} 상세정보가 없습니다.`);
            description = JSON.stringify({
              overview: "데이터가 없습니다",
            });
          }
        } catch (err) {
          console.warn(` ${name} 상세정보 조회 실패: ${err.message}`);
          if (err.response) {
            console.warn("API 응답:", err.response.data);
          }
          description = JSON.stringify({
            overview: "데이터가 없습니다",
          });
        }

        try {
          const sql = `
            INSERT INTO tourist_spots 
            (content_id, name, description, latitude, longitude, address, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              name = VALUES(name),
              description = VALUES(description),
              latitude = VALUES(latitude),
              longitude = VALUES(longitude),
              address = VALUES(address),
              image_url = VALUES(image_url)
          `;

          const [result] = await promisePool.execute(sql, [
            contentId,
            name,
            description,
            latitude,
            longitude,
            address,
            imageUrl,
            createdAt,
          ]);

          console.log(
            ` 저장 결과: ${name}, affectedRows: ${result.affectedRows}`
          );
          await new Promise((r) => setTimeout(r, 200));
        } catch (dbErr) {
          console.error(` DB 저장 실패: ${name} - ${dbErr.message}`);
          continue;
        }
      }

      pageNo++;
    } catch (err) {
      console.error(` ${pageNo}페이지 오류:`, err.message);
      if (err.response) {
        console.error("API 응답:", err.response.data);
      }
      break;
    }
  } while ((pageNo - 1) * numOfRows < totalCount);

  console.log(" 남은 경상북도 관광지 저장 완료!");
}

module.exports = { fetchTourData2 };
