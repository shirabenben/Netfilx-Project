const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// להציג את רשימת האהבתי של המשתמש
router.get('/', profileController.getProfile);

// Toggle Like (old param version)
router.post('/like/:contentId', profileController.toggleLike);

// Toggle Like (body version for content.js)
router.post('/like', profileController.toggleLike);

module.exports = router;
