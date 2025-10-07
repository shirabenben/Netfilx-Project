const express = require('express');
const router = express.Router();

const {
  getAllViewingHabits,
  getViewingHabit,
  createOrUpdateViewingHabit,
  deleteViewingHabit
} = require('../controllers/viewingHabitController');


router.route('/')
  .get(getAllViewingHabits)
  .post(createOrUpdateViewingHabit);

router.route('/:contentId')
  .get(getViewingHabit)
  .delete(deleteViewingHabit);

module.exports = router;
