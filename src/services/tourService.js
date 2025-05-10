const fetchTourData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        serviceKey: process.env.TOUR_API_KEY,
        numOfRows: 100,
        pageNo: 1,
        MobileOS: 'ETC',
        MobileApp: 'Tripico',
        _type: 'json',
        listYN: 'Y',
        arrange: 'A',
      },
    });

    if (!response.data || !response.data.response || !response.data.response.body || !response.data.response.body.items) {
      throw new Error('API 응답 데이터 형식이 올바르지 않습니다.');
    }

    let items = response.data.response.body.items.item;
    
    // 단일 객체인 경우 배열로 변환
    if (!Array.isArray(items)) {
      items = [items];
    }

    console.log(`총 ${items.length}개의 관광지 데이터를 받아왔습니다.`);

    // 데이터 저장 전에 기존 데이터 확인
    const existingContentIds = await pool.query(
      'SELECT contentid FROM tour_spots'
    );

    const existingIds = new Set(existingContentIds[0].map(item => item.contentid));

    // 데이터 저장
    for (const item of items) {
      try {
        // 필수 필드 검증
        if (!item.contentid || !item.title || !item.addr1) {
          console.warn('필수 데이터가 누락된 항목이 있습니다:', item);
          continue;
        }

        // 중복 체크
        if (existingIds.has(item.contentid)) {
          console.log(`이미 존재하는 관광지입니다: ${item.title} (${item.contentid})`);
          continue;
        }

        // overview 필드가 없는 경우 "데이터가 없습니다"로 설정
        const overview = item.overview?.trim() || '데이터가 없습니다';

        const result = await pool.query(
          `INSERT INTO tour_spots (
            contentid, title, addr1, addr2, zipcode, tel, firstimage, firstimage2,
            mapx, mapy, mlevel, areacode, sigungucode, cat1, cat2, cat3,
            createdtime, modifiedtime, booktour, overview
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.contentid,
            item.title,
            item.addr1,
            item.addr2 || '',
            item.zipcode || '',
            item.tel || '',
            item.firstimage || '',
            item.firstimage2 || '',
            item.mapx || 0,
            item.mapy || 0,
            item.mlevel || '',
            item.areacode || '',
            item.sigungucode || '',
            item.cat1 || '',
            item.cat2 || '',
            item.cat3 || '',
            item.createdtime || '',
            item.modifiedtime || '',
            item.booktour || '',
            overview
          ]
        );

        console.log(`관광지 저장 성공: ${item.title} (${item.contentid})`);
      } catch (error) {
        console.error(`관광지 저장 실패 (${item.contentid}):`, error);
        continue; // 개별 항목 저장 실패 시 다음 항목으로 계속 진행
      }
    }

    console.log('모든 관광지 데이터 저장이 완료되었습니다.');
  } catch (error) {
    console.error('관광지 데이터 가져오기 실패:', error);
    throw error;
  }
}; 