const Course = require('../models/Course');
const CourseService = require('../services/courseService');
const { validateCourseInput } = require('../utils/validators');
const { AppError } = require('../utils/errorHandler');

exports.createCourse = async (req, res) => {
  try {
    const { user_id, start_date, end_date, number_of_people, recommendation_type, trip_items } = req.body;

    validateCourseInput({ start_date, end_date, number_of_people, recommendation_type });

    const courseId = await Course.create({
      user_id,
      start_date,
      end_date,
      number_of_people,
      recommendation_type
    });

    if (trip_items && trip_items.length > 0) {
      for (const item of trip_items) {
        await Course.addTripItem({
          course_id: courseId,
          place_id: item.place_id,
          day_number: item.day_number,
          sequence: item.sequence,
          expected_time: item.expected_time
        });
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Course created successfully',
      courseId 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getUserCourses = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id) {
      throw new AppError('User ID is required', 400);
    }

    const courses = await Course.findByUserId(user_id);
    res.json({ 
      success: true, 
      courses 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Course ID is required', 400);
    }

    const course = await Course.findById(id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    res.json({ 
      success: true, 
      course 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.addTripItem = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { place_id, day_number, sequence, expected_time } = req.body;

    if (!course_id || !place_id || !day_number || !sequence) {
      throw new AppError('Missing required fields', 400);
    }

    const tripItemId = await Course.addTripItem({
      course_id,
      place_id,
      day_number,
      sequence,
      expected_time
    });

    res.status(201).json({
      success: true,
      message: 'Trip item added successfully',
      tripItemId
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTripItem = async (req, res) => {
  try {
    const { course_id, item_id } = req.params;
    const { sequence, expected_time } = req.body;

    if (!course_id || !item_id) {
      throw new AppError('Course ID and Item ID are required', 400);
    }

    await Course.updateTripItem(item_id, {
      sequence,
      expected_time
    });

    res.json({
      success: true,
      message: 'Trip item updated successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteTripItem = async (req, res) => {
  try {
    const { course_id, item_id } = req.params;

    if (!course_id || !item_id) {
      throw new AppError('Course ID and Item ID are required', 400);
    }

    await Course.deleteTripItem(item_id);

    res.json({
      success: true,
      message: 'Trip item deleted successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    });
  }
};

exports.recommendCourse = async (req, res) => {
  try {
    const { user_id } = req.params;
    const preferences = req.body;

    if (!user_id) {
      throw new AppError('User ID is required', 400);
    }

    const recommendedCourse = await CourseService.recommendCourse(user_id, preferences);
    res.json({ 
      success: true, 
      course: recommendedCourse 
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 