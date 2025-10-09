const User = require('../models/User');
const Profile = require('../models/Profile');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { username, email, firstName, lastName } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Register new user with automatic profile creation
const createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, profileName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user first (validation allows empty profiles for new users)
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    // Create the profile
    const profile = new Profile({
      name: profileName || `${firstName}'s Profile`,
      user: user._id
    });

    await profile.save();

    // Add profile to user
    user.profiles.push(profile._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user,
        profile: profile
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Get user profiles - can return JSON or render HTML based on request
const getUserProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('profiles');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if this is an API request (based on route or Accept header)
    const isAPIRequest = req.route.path.includes('/api/') || 
                        req.headers.accept?.includes('application/json');

    if (isAPIRequest) {
      // Return JSON for API requests
      res.json({
        success: true,
        data: {
          profiles: user.profiles,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      });
    } else {
      // Render HTML for page requests
      res.render('profile', {
        title: 'Netflix Project - Select Profile',
        profiles: user.profiles,
        user: user
      });
    }
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    
    // Check if this is an API request for error handling too
    const isAPIRequest = req.route.path.includes('/api/') || 
                        req.headers.accept?.includes('application/json');
    
    if (isAPIRequest) {
      res.status(500).json({
        success: false,
        message: 'Error loading profiles',
        error: error.message
      });
    } else {
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error loading profiles'
      });
    }
  }
};

// Create new profile
const createProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    // Check if user already has 5 profiles (max limit)
    const user = await User.findById(userId).populate('profiles');
    if (user.profiles.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 5 profiles allowed per user'
      });
    }

    // Create new profile
    const profile = new Profile({
      name,
      user: userId
    });

    await profile.save();

    // Add profile to user's profiles array
    user.profiles.push(profile._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Profile name already exists for this user'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  getUserProfiles,
  createProfile,
  updateUser,
  deleteUser
};
