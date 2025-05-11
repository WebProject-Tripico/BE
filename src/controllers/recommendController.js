const TouristSpot = require('../models/TouristSpot');
const kakaoService = require('../services/kakaoService');

exports.recommendCourse = async (req, res) => {
  try {
    const { region, maxMoveTime, groupSize, transportation, description, startPoint } = req.body;

    const spots = await TouristSpot.findByRegion(region);

    const recommended = spots.slice(0, 10);

    const withMoveTime = await kakaoService.addMoveTimes(recommended, transportation, startPoint);

    const filtered = withMoveTime.filter(
      spot => spot && typeof spot.move_time === 'number' && spot.move_time <= maxMoveTime
    );

    res.json({
      spots: filtered.map(spot => ({
        id: spot.id,
        name: spot.name,
        description: spot.description,
        latitude: spot.latitude,
        longitude: spot.longitude,
        image_url: spot.image_url,
        move_time: spot.move_time
      }))
    });
  } catch (err) {
    res.status(500).json({ message: '추천 과정에서 오류 발생', error: err.message });
  }
};