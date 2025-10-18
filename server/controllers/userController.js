const User = require('../models/User');
const Profile = require('../models/Profile');
const ViewingHabit = require('../models/ViewingHabit');
const Content = require('../models/Content');

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

    console.log('Creating profile:', { name, userId });

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required'
      });
    }

    // Check if user already has 5 profiles (max limit)
    // IMPORTANT: Must populate to check which profiles actually exist
    const user = await User.findById(userId).populate('profiles');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out null/undefined (deleted profiles that still have references)
    const actualProfiles = user.profiles.filter(p => p != null);
    
    console.log(`Profile check for user ${userId}:`);
    console.log(`  - Array has ${user.profiles.length} references`);
    console.log(`  - Actually exist: ${actualProfiles.length} profiles`);
    console.log(`  - Profile names: ${actualProfiles.map(p => p.name).join(', ')}`);

    // Clean up orphaned references if any
    if (actualProfiles.length < user.profiles.length) {
      console.log(`  - Cleaning up ${user.profiles.length - actualProfiles.length} orphaned references`);
      user.profiles = actualProfiles.map(p => p._id);
      await user.save();
    }

    if (actualProfiles.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 5 profiles allowed per user'
      });
    }

    // Check if profile name already exists for this user
    const existingProfile = await Profile.findOne({ user: userId, name: name.trim() });
    if (existingProfile) {
      console.log('Profile name already exists:', existingProfile._id);
      return res.status(400).json({
        success: false,
        message: 'A profile with this name already exists'
      });
    }

    // Create new profile
    const profile = new Profile({
      name: name.trim(),
      user: userId
    });

    await profile.save();
    console.log('Profile created:', profile._id);

    // Add profile to user's profiles array (using update to avoid re-validating password)
    await User.findByIdAndUpdate(userId, {
      $push: { profiles: profile._id }
    });
    console.log('Profile added to user');

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });

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
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
};

// Get watched content for a profile
const getWatchedContent = async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await Profile.findById(profileId).populate('watchedContent.contentId');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ 
      success: true, 
      count: profile.watchedContent.length, 
      data: profile.watchedContent 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching watched content', 
      error: error.message 
    });
  }
};

// Get unwatched content for a profile
const getUnwatchedContent = async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await Profile.findById(profileId).populate('watchedContent.contentId');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Get all active content
    const Content = require('../models/Content');
    const allContent = await Content.find({ isActive: true });

    // Get IDs of watched content
    const watchedIds = profile.watchedContent.map(item => {
      // Handle both populated (object) and non-populated (ObjectId) cases
      if (item.contentId && item.contentId._id) {
        return item.contentId._id.toString();
      }
      return item.contentId.toString();
    });

    console.log(`Unwatched content check for profile ${profileId}: ${watchedIds.length} watched items`);

    // Filter out watched content to get unwatched content
    const unwatchedContent = allContent.filter(
      item => !watchedIds.includes(item._id.toString())
    );

    res.json({ 
      success: true, 
      count: unwatchedContent.length, 
      data: unwatchedContent 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching unwatched content', 
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
    const actualProfiles = user.profiles.filter(p => p != null);
    
    if (actualProfiles.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last profile. Each user must have at least one profile'
      });
    }

    // Delete the profile first
    await Profile.findByIdAndDelete(profileId);

    // Remove profile from user's profiles array (using update to avoid re-validating password)
    await User.findByIdAndUpdate(userId, {
      $pull: { profiles: profileId }
    });

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
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
    endDate.setHours(23, 59, 59, 999); // End of today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1); // Include today in the count
    startDate.setHours(0, 0, 0, 0); // Start of the day

    // Get all viewing history from all profiles within date range
    const allViewingHistory = [];
    let totalWatchedContent = 0;
    user.profiles.forEach(profile => {
      if (profile.watchedContent && profile.watchedContent.length > 0) {
        profile.watchedContent.forEach(watch => {
          // Check if content is populated
          if (!watch.contentId) {
            console.warn('Warning: watchedContent item missing contentId', watch);
            return;
          }
          
          // watchedAt is an array of dates, so we need to process each date
          const watchDates = Array.isArray(watch.watchedAt) ? watch.watchedAt : [watch.watchedAt];
          
          watchDates.forEach(watchDate => {
            totalWatchedContent++;
            const dateObj = watchDate instanceof Date ? watchDate : new Date(watchDate);
            
            if (dateObj >= startDate && dateObj <= endDate) {
              allViewingHistory.push({
                profile: profile,
                content: watch.contentId,
                watchedAt: dateObj,
                duration: 0 // Duration not tracked in current schema
              });
            }
          });
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
      dailyViews: [],
      profiles: user.profiles.map(p => ({ id: p._id.toString(), name: p.name })),
      profileStats: [],
      contentTypes: []
    };

    // Generate daily views data
    const dailyViewsMap = new Map();
    const mapStartDate = new Date(startDate);
    for (let i = 0; i < days; i++) {
      const date = new Date(mapStartDate);
      date.setDate(mapStartDate.getDate() + i);
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
      return {
        name: profile.name,
        views: profileViews.length
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

    // Calculate content popularity by genre
    // First, get all content and count their views
    const contentViewCounts = new Map();
    allViewingHistory.forEach(vh => {
      if (vh.content && vh.content._id) {
        const contentId = vh.content._id.toString();
        contentViewCounts.set(contentId, (contentViewCounts.get(contentId) || 0) + 1);
      }
    });



    // Get all content items with their genres
    const allContent = await Content.find({ isActive: true });
    
    // Organize content by genre
    const contentByGenre = new Map();
    
    allContent.forEach(content => {
      const contentId = content._id.toString();
      const viewCount = contentViewCounts.get(contentId) || 0;
      
      // Only include content that has been viewed
      if (viewCount > 0 && content.genre && Array.isArray(content.genre)) {
        content.genre.forEach(genreName => {
          if (!contentByGenre.has(genreName)) {
            contentByGenre.set(genreName, []);
          }
          
          contentByGenre.get(genreName).push({
            contentId: contentId,
            title: content.title,
            type: content.type,
            popularity: content.popularity || 1,
            views: viewCount
          });
        });
      }
    });



    // Convert to array format and sort
    stats.contentByGenre = Array.from(contentByGenre.entries())
      .map(([genre, contents]) => {
        const totalViews = contents.reduce((sum, c) => sum + c.views, 0);
        
        // Sort by views descending, then by popularity
        const sortedContent = contents
          .sort((a, b) => {
            if (b.views !== a.views) return b.views - a.views;
            return b.popularity - a.popularity;
          })
          .slice(0, 5); // Top 5 content per genre
        
        return {
          genre,
          totalViews,
          content: sortedContent
        };
      })
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 6); // Top 6 genres

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

// Cleanup orphaned profile references
const cleanupOrphanedProfiles = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('profiles');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const beforeCount = user.profiles.length;
    const actualProfiles = user.profiles.filter(p => p != null);
    const afterCount = actualProfiles.length;
    const orphanedCount = beforeCount - afterCount;

    if (orphanedCount > 0) {
      user.profiles = actualProfiles.map(p => p._id);
      await user.save();

      return res.json({
        success: true,
        message: `Cleaned up ${orphanedCount} orphaned profile reference(s)`,
        before: beforeCount,
        after: afterCount,
        profiles: actualProfiles.map(p => ({ id: p._id, name: p.name }))
      });
    } else {
      return res.json({
        success: true,
        message: 'No orphaned references found',
        profileCount: actualProfiles.length,
        profiles: actualProfiles.map(p => ({ id: p._id, name: p.name }))
      });
    }
  } catch (error) {
    console.error('Error cleaning up profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up profiles',
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
  getWatchedContent,
  getUnwatchedContent,
  getUserStatistics,
  cleanupOrphanedProfiles
};
