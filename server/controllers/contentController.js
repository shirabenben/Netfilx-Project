const Content = require('../models/Content');
const Profile = require('../models/Profile'); // Added Profile import

const VALID_SORT_FIELDS = ['createdAt', 'year', 'popularity', 'starRating', 'watched', 'unwatched'];

// Get all content with optional filtering
const getAllContent = async (req, res) => {
  try {
    // 1. Destructure query parameters
    const {
      page = 1,
      limit = 10,
      genre,
      type,
      year,
      search,
      sort = '-createdAt', // Default sort
      profileId // Profile ID for watched/unwatched sorting
    } = req.query;

    // Determine actual sort field and order
    let sortField = '-createdAt';
    let isWatchedSort = false;
    let watchedSortOrder = 1; // 1 for watched first, -1 for unwatched first
    
    if (sort) {
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      const field = sort.startsWith('-') ? sort.substring(1) : sort;
      
      if (field === 'watched' || field === 'unwatched') {
        isWatchedSort = true;
        watchedSortOrder = field === 'watched' ? sortOrder : -sortOrder;
      } else if (VALID_SORT_FIELDS.includes(field)) {
        sortField = { [field]: sortOrder };
      }
    }

    // 2. Build the query object
    const query = { isActive: true };
    if (genre) {
      query.genre = { $in: genre.split(',') };
    }
    if (type) {
      query.type = type;
    }
    if (year) {
      query.year = year;
    }
    if (search) {
      query.$text = { $search: search };
    }

    // 3. Parse page and limit
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // 4. Get watched content IDs if needed for sorting
    let watchedContentIds = [];
    if (isWatchedSort && profileId) {
      const profile = await Profile.findById(profileId);
      if (profile) {
        watchedContentIds = profile.watchedContent.map(item => item.contentId.toString());
      }
    }

    // 5. Execute queries
    const [allResults, totalDocs] = await Promise.all([
        Content.find(query)
            .sort(isWatchedSort ? '-createdAt' : sortField) // Use default sort for watched sorting
            .select('-__v')
            .lean(),
        Content.countDocuments(query)
    ]);

    // 6. Apply watched/unwatched sorting if needed
    let results = allResults;
    if (isWatchedSort && profileId) {
      results = allResults.sort((a, b) => {
        const aWatched = watchedContentIds.includes(a._id.toString());
        const bWatched = watchedContentIds.includes(b._id.toString());
        
        if (aWatched === bWatched) return 0;
        if (watchedSortOrder === 1) {
          return aWatched ? -1 : 1; // Watched first
        } else {
          return aWatched ? 1 : -1; // Unwatched first
        }
      });
    }

    // 7. Apply pagination after sorting
    const paginatedResults = results.slice(skip, skip + limitNum);

    // 8. Calculate total pages
    const totalPages = Math.ceil(totalDocs / limitNum);

    // 9. Send the response
    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: totalDocs,
        page: pageNum,
        pages: totalPages,
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Get single content by ID
const getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Create new content
const createContent = async (req, res) => {
  try {
    const content = new Content(req.body);
    await content.save();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
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
      message: 'Error creating content',
      error: error.message
    });
  }
};

// Update content
const updateContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
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
      message: 'Error updating content',
      error: error.message
    });
  }
};

// Delete content (soft delete by setting isActive to false)
const deleteContent = async (req, res) => {
  try {
    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

// Get content by genre
const getContentByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const content = await Content.find({
      genre: genre,
      isActive: true
    }).sort('-year');

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching content by genre',
      error: error.message
    });
  }
};

// Get trending content (recently added)
const getTrendingContent = async (req, res) => {
  try {
    const content = await Content.find({ isActive: true })
      .sort('-createdAt')
      .limit(20);

    res.json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending content',
      error: error.message
    });
  }
};

// Get top 5 most popular content (using GroupBy for viewing habits)
const getMostPopularContent = async (req, res) => {
  try {
    // Aggregate viewing habits to find most watched content
    const popularContent = await ViewingHabit.aggregate([
      {
        $group: {
          _id: '$content',
          viewCount: { $sum: 1 },
          avgProgress: { $avg: '$watchProgress' }
        }
      },
      {
        $sort: { viewCount: -1, avgProgress: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'contents',
          localField: '_id',
          foreignField: '_id',
          as: 'contentDetails'
        }
      },
      {
        $unwind: '$contentDetails'
      },
      {
        $match: {
          'contentDetails.isActive': true
        }
      },
      {
        $project: {
          _id: '$contentDetails._id',
          title: '$contentDetails.title',
          description: '$contentDetails.description',
          genre: '$contentDetails.genre',
          year: '$contentDetails.year',
          type: '$contentDetails.type',
          imageUrl: '$contentDetails.imageUrl',
          viewCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      count: popularContent.length,
      data: popularContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular content',
      error: error.message
    });
  }
};

// Get top 5 newest movies
const getNewestMovies = async (req, res) => {
  try {
    const newestMovies = await Content.find({
      type: 'movie',
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title description genre year type imageUrl createdAt');

    res.json({
      success: true,
      count: newestMovies.length,
      data: newestMovies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching newest movies',
      error: error.message
    });
  }
};

// Get top 5 newest series
const getNewestSeries = async (req, res) => {
  try {
    const newestSeries = await Content.find({
      type: 'series',
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title description genre year type imageUrl createdAt');

    res.json({
      success: true,
      count: newestSeries.length,
      data: newestSeries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching newest series',
      error: error.message
    });
  }
};

const markContentAsWatched = async (req, res) => {
  try {
    const { profileId, contentId, watched, duration = 0 } = req.body;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Verify content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    if (watched) {
      // Check if content is already in watchedContent
      const alreadyWatched = profile.watchedContent.some(
        (item) => item.contentId.toString() === contentId
      );

      if (!alreadyWatched) {
        // Add new viewing history entry
        profile.watchedContent.push({
          contentId: contentId,
          watchedAt: new Date(),
          duration: duration
        });
      } else {
        // Update existing entry's watchedAt and duration
        const existingEntry = profile.watchedContent.find(
          (item) => item.contentId.toString() === contentId
        );
        existingEntry.watchedAt = new Date();
        if (duration > 0) {
          existingEntry.duration = duration;
        }
      }
    } else {
      // Remove from watchedContent
      profile.watchedContent = profile.watchedContent.filter(
        (item) => item.contentId.toString() !== contentId
      );
    }

    await profile.save();

    res.json({ success: true, message: 'Profile content watch status updated successfully', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating content watch status', error: error.message });
  }
};

module.exports = {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByGenre,
  getTrendingContent,
  getMostPopularContent,
  getNewestMovies,
  getNewestSeries,
  markContentAsWatched,
};