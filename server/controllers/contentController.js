const Content = require('../models/Content');
const Profile = require('../models/Profile'); // Added Profile import

const VALID_SORT_FIELDS = ['createdAt', 'year', 'popularity', 'starRating', 'watched', 'unwatched'];

// Get all content with optional filtering
const getAllContent = async (req, res) => {
  try {
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
    if (genre) query.genre = { $in: genre.split(',') };
    if (type) query.type = type;
    if (year) query.year = year;
    if (search) query.$text = { $search: search };

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

// Get single content by ID (for EJS rendering)
const getContentById = async (req, res) => {
  try {
    const contentId = req.params.id;
    const profileId = req.session?.profileId || req.query.profileId;
    const profile = profileId ? await Profile.findById(profileId).lean() : null;

    // ⚡ המרת watchProgress ל־Map לפני כל שימוש
    if (profile?.watchProgress) {
      if (!(profile.watchProgress instanceof Map)) {
        profile.watchProgress = new Map(Object.entries(profile.watchProgress.toObject?.() || profile.watchProgress));
      }
    }

    const content = await Content.findById(contentId).lean();
    if (!content) return res.status(404).send('Content not found');

    if (!['movie', 'series'].includes(content.type)) {
      return res.status(400).send('Invalid content type');
    }

    const starRatingDisplay =
      content.starRating != null ? `${content.starRating} ⭐` : 'N/A ⭐';

    const liked = profile?.likedContents?.some(id => id.toString() === contentId) || false;
    const watchProgress = profile?.watchProgress?.get(contentId) || 0;

    let episodes = [];
    if (content.type === 'series') {
      episodes = await Content.find({ seriesId: content._id })
        .sort({ episodeNumber: 1 })
        .lean();
    }

    const seriesFinished =
      content.type === 'series' &&
      profile &&
      episodes.length > 0 &&
      profile.watchProgress?.get(episodes[episodes.length - 1]._id.toString()) >=
        (episodes[episodes.length - 1].duration || 0) - 5;

    let lastWatchedEpisode = null;
    if (profile && content.type === 'series' && episodes.length) {
      for (let ep of episodes.reverse()) {
        if (profile.watchProgress?.get(ep._id.toString()) > 0) {
          lastWatchedEpisode = ep._id.toString();
          break;
        }
      }
    }

    const similarContents = await Content.find({
      _id: { $ne: content._id },
      genre: { $in: content.genre },
      type: { $in: ['movie', 'series'] }
    }).limit(6).lean();

    res.render('content', {
      content,
      profile,           // ⚡ שולח את profile כדי שהטיימליין יעבוד
      profileId: profile?._id,
      liked,
      watchProgress,
      episodes,
      seriesFinished,
      lastWatchedEpisode,
      similarContents,
      starRatingDisplay,
    });
  } catch (err) {
    console.error('Error loading content page:', err);
    res.status(500).send('Server error');
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

// Delete content (soft delete)
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

// Get trending content
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

// Get top 5 most popular content
const getMostPopularContent = async (req, res) => {
  try {
    const popularContent = await ViewingHabit.aggregate([
      {
        $group: {
          _id: '$content',
          viewCount: { $sum: 1 },
          avgProgress: { $avg: '$watchProgress' }
        }
      },
      { $sort: { viewCount: -1, avgProgress: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'contents',
          localField: '_id',
          foreignField: '_id',
          as: 'contentDetails'
        }
      },
      { $unwind: '$contentDetails' },
      { $match: { 'contentDetails.isActive': true } },
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

const old_getContentById = async (req, res) => {
  try {
    // שולף את כל השדות כולל actors ו-starRating
    const content = await Content.findById(req.params.id).lean();

    if (!content) {
      return res.status(404).send('Content not found');
    }

    // שולף פרקים אם מדובר בסדרה
    const episodes = content.type === 'series'
      ? await Content.find({ seriesId: content._id }).sort('episodeNumber').lean()
      : [];

    // שולף תוכן דומה (אותו סוג ז'אנר, לא כולל את אותו תוכן)
    const similarContents = await Content.find({
      genre: { $in: content.genre },
      _id: { $ne: content._id },
      isActive: true
    }).limit(6).lean();

    // שולח את הנתונים ל-EJS
    res.render('content', {
      content,
      profileId: req.session?.profileId || null,
      episodes,
      similarContents,
      watchProgress: 0,
      liked: false,
      lastWatchedEpisode: null,
      seriesFinished: false
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching content');
  }
};


module.exports = {
  getAllContent,
  getContentById,
  old_getContentById,
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
