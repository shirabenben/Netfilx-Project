const User = require('../models/User');
const Profile = require('../models/Profile');
const ViewingHabit = require('../models/ViewingHabit');

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

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const profileId = req.params.id;
    const userId = req.user._id;

    // Find the profile
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify that the profile belongs to the authenticated user
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this profile'
      });
    }

    // Update the profile
    profile.name = name || profile.name;
    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Profile name already exists for this user'
      });
    }
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
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const userId = req.user._id;

    // Find the profile
    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Verify that the profile belongs to the authenticated user
    if (profile.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this profile'
      });
    }

    // Check if user has only one profile (prevent deletion of last profile)
    const user = await User.findById(userId).populate('profiles');
    if (user.profiles.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last profile. Each user must have at least one profile'
      });
    }

    // Remove profile from user's profiles array
    user.profiles = user.profiles.filter(p => p._id.toString() !== profileId.toString());
    await user.save();

    // Delete the profile
    await Profile.findByIdAndDelete(profileId);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting profile',
      error: error.message
    });
  }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    
    // Get user's profiles with populated watched content
    const user = await User.findById(userId).populate({
      path: 'profiles',
      populate: {
        path: 'watchedContent.contentId',
        model: 'Content'
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all viewing history from all profiles within date range
    const allViewingHistory = [];
    user.profiles.forEach(profile => {
      if (profile.watchedContent && profile.watchedContent.length > 0) {
        profile.watchedContent.forEach(watch => {
          if (watch.watchedAt >= startDate && watch.watchedAt <= endDate) {
            allViewingHistory.push({
              profile: profile,
              content: watch.contentId,
              watchedAt: watch.watchedAt,
              duration: watch.duration
            });
          }
        });
      }
    });

    // Get viewing habits for liked content count
    const profileIds = user.profiles.map(p => p._id);
    const viewingHabits = await ViewingHabit.find({
      profile: { $in: profileIds }
    });

    // Calculate statistics
    const stats = {
      totalViews: allViewingHistory.length,
      uniqueContent: new Set(allViewingHistory.map(vh => vh.content?._id.toString()).filter(Boolean)).size,
      totalHours: allViewingHistory.reduce((sum, vh) => sum + ((vh.duration || 0) / 3600), 0),
      likedContent: viewingHabits.filter(vh => vh.liked).length,
      dailyViews: [],
      profiles: user.profiles.map(p => ({ id: p._id.toString(), name: p.name })),
      profileStats: [],
      contentTypes: []
    };

    // Generate daily views data
    const dailyViewsMap = new Map();
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyViewsMap.set(dateStr, {
        date: dateStr,
        profiles: user.profiles.map(p => ({ profileId: p._id.toString(), count: 0 }))
      });
    }

    // Count views per day per profile from watching history
    allViewingHistory.forEach(vh => {
      const dateStr = new Date(vh.watchedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayData = dailyViewsMap.get(dateStr);
      if (dayData) {
        const profileData = dayData.profiles.find(p => p.profileId === vh.profile._id.toString());
        if (profileData) {
          profileData.count++;
        }
      }
    });

    stats.dailyViews = Array.from(dailyViewsMap.values());

    // Calculate profile stats
    stats.profileStats = user.profiles.map(profile => {
      const profileViews = allViewingHistory.filter(vh => vh.profile._id.toString() === profile._id.toString());
      const profileHabits = viewingHabits.filter(vh => vh.profile.toString() === profile._id.toString());
      return {
        name: profile.name,
        views: profileViews.length,
        hours: profileViews.reduce((sum, vh) => sum + ((vh.duration || 0) / 3600), 0),
        favorites: profileHabits.filter(vh => vh.liked).length
      };
    });

    // Calculate content type distribution
    const contentTypeMap = new Map();
    allViewingHistory.forEach(vh => {
      if (vh.content && vh.content.type) {
        const type = vh.content.type;
        contentTypeMap.set(type, (contentTypeMap.get(type) || 0) + 1);
      }
    });

    stats.contentTypes = Array.from(contentTypeMap.entries()).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
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
  updateProfile,
  deleteProfile,
  updateUser,
  deleteUser,
  getUserStatistics
};
