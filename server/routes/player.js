const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Loads the player page
router.get('/:contentId/:profileId', playerController.getPlayerPage);

// Resets watch progress
router.post('/reset/:contentId/:profileId', playerController.resetProgress);

module.exports = router;
