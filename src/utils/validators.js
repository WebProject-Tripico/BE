const { AppError } = require('./errorHandler');

const validateUserInput = (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Please provide a valid email address', 400);
  }
};

const validateCourseInput = (courseData) => {
  const { start_date, end_date, number_of_people, recommendation_type } = courseData;

  if (!start_date || !end_date || !number_of_people || !recommendation_type) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (new Date(start_date) > new Date(end_date)) {
    throw new AppError('Start date must be before end date', 400);
  }

  if (number_of_people < 1) {
    throw new AppError('Number of people must be at least 1', 400);
  }
};

module.exports = {
  validateUserInput,
  validateCourseInput
}; 