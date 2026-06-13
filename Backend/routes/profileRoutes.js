const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { profileUpload } = require('../middleware/uploadMiddleware');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/photo', protect, profileUpload.single('profilePhoto'), uploadProfilePhoto);

module.exports = router;
