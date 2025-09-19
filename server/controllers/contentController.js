const Content = require('../models/Content');

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
      sort = '-createdAt'
    } = req.query;

    const query = { isActive: true };

    // Add filters
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

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
      select: '-__v'
    };

    const result = await Content.paginate(query, options);

    res.json({
      success: true,
      data: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        pages: result.totalPages,
        limit: result.limit
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

module.exports = {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByGenre,
  getTrendingContent
};
