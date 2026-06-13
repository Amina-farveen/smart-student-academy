const Profile = require('../models/Profile');
const path = require('path');
const fs = require('fs');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await Profile.create({
        userId: req.user._id,
        fullName: req.user.name,
        email: req.user.email
      });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { fullName, registerNumber, collegeName, department, semester, email, phone } = req.body;

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new Profile({ userId: req.user._id });
    }

    if (fullName !== undefined) profile.fullName = fullName;
    if (registerNumber !== undefined) profile.registerNumber = registerNumber;
    if (collegeName !== undefined) profile.collegeName = collegeName;
    if (department !== undefined) profile.department = department;
    if (semester !== undefined) profile.semester = semester;
    if (email !== undefined) profile.email = email;
    if (phone !== undefined) profile.phone = phone;

    await profile.save();

    res.json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// @desc    Upload profile photo
// @route   POST /api/profile/photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new Profile({ userId: req.user._id });
    }

    // Delete old photo if exists
    if (profile.profilePhoto) {
      const oldPath = path.join(__dirname, '..', profile.profilePhoto);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    profile.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    await profile.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { profilePhoto: profile.profilePhoto }
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading photo' });
  }
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto };
