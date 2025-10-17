const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// טוען את עמוד הנגן
router.get('/:contentId/:profileId', playerController.getPlayerPage);

// איפוס צפייה
router.post('/reset/:contentId/:profileId', playerController.resetProgress);

module.exports = router;
