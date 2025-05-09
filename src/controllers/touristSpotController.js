const TouristSpot = require('../models/TouristSpot');

exports.getAllSpots = async (req, res) => {
  try {
    const spots = await TouristSpot.findAll();
    res.json({ success: true, spots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSpotById = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await TouristSpot.findById(id);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Tourist spot not found' });
    }
    res.json({ success: true, spot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSpotsByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const spots = await TouristSpot.findByLocation(latitude, longitude, radius);
    res.json({ success: true, spots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 