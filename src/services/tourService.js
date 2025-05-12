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
    
    if (!Array.isArray(items)) {
      items = [items];
    }

    console.log(`총 ${items.length}개의 관광지 데이터를 받아왔습니다.`);

    const existingContentIds = await pool.query(
      'SELECT contentid FROM tourist_spots'
    );

    const existingIds = new Set(existingContentIds[0].map(item => item.contentid));

    for (const item of items) {
      try {
        if (!item.contentid || !item.title || !item.addr1) {
          console.warn('필수 데이터가 누락된 항목이 있습니다:', item);
          continue;
        }

        if (existingIds.has(item.contentid)) {
          console.log(`이미 존재하는 관광지입니다: ${item.title} (${item.contentid})`);
          continue;
        }

        const overview = item.overview?.trim() || '데이터가 없습니다';

        const result = await pool.query(
          `INSERT INTO tourist_spots (
            content_id, name, description, latitude, longitude, address, image_url, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            description = VALUES(description),
            latitude = VALUES(latitude),
            longitude = VALUES(longitude),
            address = VALUES(address),
            image_url = VALUES(image_url)`,
          [
            item.contentid,
            item.title,
            overview,
            item.mapy || 0,
            item.mapx || 0,
            item.addr1,
            item.firstimage || '',
          ]
        );

        console.log(`관광지 저장 성공: ${item.title} (${item.contentid})`);
      } catch (error) {
        console.error(`관광지 저장 실패 (${item.contentid}):`, error);
        continue;
      }
    }

    console.log('모든 관광지 데이터 저장이 완료되었습니다.');
  } catch (error) {
    console.error('관광지 데이터 가져오기 실패:', error);
    throw error;
  }
}; 