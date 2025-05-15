const { promisePool } = require("../src/config/database");
const axios = require("axios");
require("dotenv").config();

async function testDBConnection() {
  try {
    const [tables] = await promisePool.execute(
      'SHOW TABLES LIKE "tourist_spots"'
    );
    if (tables.length === 0) {
      console.error(" tourist_spots 테이블이 존재하지 않습니다.");
      return false;
    }

    const [columns] = await promisePool.execute("DESCRIBE tourist_spots");
    console.log(" 테이블 구조:", columns);

    const testSql = `
      INSERT INTO tourist_spots 
      (content_id, name, description, latitude, longitude, address, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const testData = [
      "test123",
      "테스트 장소",
      "테스트 설명",
      35.123456,
      128.123456,
      "테스트 주소",
      "http://test.com",
      new Date(),
    ];

    const [result] = await promisePool.execute(testSql, testData);
    console.log("테스트 데이터 저장 성공:", result);

    await promisePool.execute(
      "DELETE FROM tourist_spots WHERE content_id = ?",
      ["test123"]
    );
    console.log(" 테스트 데이터 삭제 완료");

    return true;
  } catch (error) {
    console.error(" DB 연결 테스트 실패:", error);
    return false;
  }
}

async function fetchTourData(areaCode = 35, contentTypeId = 12) {
  const isConnected = await testDBConnection();
  if (!isConnected) {
    console.error("DB 연결 실패로 인해 데이터 저장을 중단합니다.");
    return;
  }

  const apiKey = process.env.TOUR_API_KEY;
  const numOfRows = 100;
  let pageNo = 1;
  let totalCount = 0;
  let startSaving = false;

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

        console.log(`현재 처리 중: ${item.title} (${contentId})`);

        if (item.title === "유등지") {
          console.log(
            "유등지를 찾았습니다. 다음 데이터부터 저장을 시작합니다."
          );
          startSaving = true;
          continue;
        }

        if (!startSaving) {
          console.log(`건너뛰기: ${item.title} (유등지 이전 데이터)`);
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

          console.log("실행할 SQL:", sql);
          console.log("파라미터:", {
            contentId,
            name,
            description: description.substring(0, 100) + "...",
            latitude,
            longitude,
            address,
            imageUrl,
            createdAt,
          });

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

          console.log("SQL 실행 결과:", {
            affectedRows: result.affectedRows,
            insertId: result.insertId,
            message: result.message,
          });

          if (result.affectedRows === 0) {
            console.warn(` 저장 실패: ${name} - affectedRows가 0입니다.`);
          } else {
            console.log(
              ` 저장 성공: ${name}, affectedRows: ${result.affectedRows}`
            );
          }

          await new Promise((r) => setTimeout(r, 200));
        } catch (dbErr) {
          console.error(` DB 저장 실패: ${name}`);
          console.error(`에러 메시지: ${dbErr.message}`);
          console.error(`SQL 쿼리: ${sql}`);
          console.error(`파라미터:`, {
            contentId,
            name,
            description: description.substring(0, 100) + "...",
            latitude,
            longitude,
            address,
            imageUrl,
            createdAt,
          });
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

  console.log(" 유등지 다음 관광지 저장 완료!");
}

module.exports = { fetchTourData };
