const Content = require('../models/Content');
const ViewingHabit = require('../models/ViewingHabit');

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
      sort = '-createdAt'
    } = req.query;

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

    // 4. Execute queries in parallel for efficiency
    const [results, totalDocs] = await Promise.all([
        Content.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-__v')
            .lean(),
        Content.countDocuments(query)
    ]);

    // 5. Calculate total pages
    const totalPages = Math.ceil(totalDocs / limitNum);

    // 6. Send the response
    res.json({
      success: true,
      data: results,
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
  getNewestSeries
};
