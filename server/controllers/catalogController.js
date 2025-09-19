const Catalog = require('../models/Catalog');
const Content = require('../models/Content');

// Get all catalogs for a user
const getUserCatalogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const catalogs = await Catalog.find({ user: userId })
      .populate('content', 'title posterUrl type')
      .sort('-updatedAt');

    res.json({
      success: true,
      count: catalogs.length,
      data: catalogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching catalogs',
      error: error.message
    });
  }
};

// Get single catalog by ID
const getCatalogById = async (req, res) => {
  try {
    const catalog = await Catalog.findById(req.params.id)
      .populate('user', 'username firstName lastName')
      .populate('content', 'title description posterUrl type year rating');

    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching catalog',
      error: error.message
    });
  }
};

// Create new catalog
const createCatalog = async (req, res) => {
  try {
    const { name, description, type, isPublic, content } = req.body;
    const userId = req.body.userId || req.user?.id; // Assuming auth middleware sets req.user

    const catalog = new Catalog({
      name,
      description,
      type: type || 'custom',
      isPublic: isPublic || false,
      user: userId,
      content: content || []
    });

    await catalog.save();

    // Populate the created catalog
    await catalog.populate('user', 'username firstName lastName');
    await catalog.populate('content', 'title posterUrl type');

    res.status(201).json({
      success: true,
      message: 'Catalog created successfully',
      data: catalog
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
        message: 'Catalog name already exists for this user'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating catalog',
      error: error.message
    });
  }
};

// Update catalog
const updateCatalog = async (req, res) => {
  try {
    const { name, description, isPublic, content } = req.body;

    const catalog = await Catalog.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(content && { content })
      },
      { new: true, runValidators: true }
    ).populate('user', 'username firstName lastName')
     .populate('content', 'title posterUrl type');

    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    res.json({
      success: true,
      message: 'Catalog updated successfully',
      data: catalog
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
        message: 'Catalog name already exists for this user'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating catalog',
      error: error.message
    });
  }
};

// Delete catalog
const deleteCatalog = async (req, res) => {
  try {
    const catalog = await Catalog.findByIdAndDelete(req.params.id);

    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    res.json({
      success: true,
      message: 'Catalog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting catalog',
      error: error.message
    });
  }
};

// Add content to catalog
const addContentToCatalog = async (req, res) => {
  try {
    const { contentId } = req.body;
    const catalogId = req.params.id;

    // Verify content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const catalog = await Catalog.findById(catalogId);
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    // Add content if not already in catalog
    if (!catalog.content.includes(contentId)) {
      catalog.content.push(contentId);
      await catalog.save();
    }

    await catalog.populate('content', 'title posterUrl type');

    res.json({
      success: true,
      message: 'Content added to catalog successfully',
      data: catalog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding content to catalog',
      error: error.message
    });
  }
};

// Remove content from catalog
const removeContentFromCatalog = async (req, res) => {
  try {
    const { contentId } = req.params;
    const catalogId = req.params.id;

    const catalog = await Catalog.findById(catalogId);
    if (!catalog) {
      return res.status(404).json({
        success: false,
        message: 'Catalog not found'
      });
    }

    // Remove content from catalog
    catalog.content = catalog.content.filter(id => id.toString() !== contentId);
    await catalog.save();

    await catalog.populate('content', 'title posterUrl type');

    res.json({
      success: true,
      message: 'Content removed from catalog successfully',
      data: catalog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing content from catalog',
      error: error.message
    });
  }
};

// Get public catalogs
const getPublicCatalogs = async (req, res) => {
  try {
    const catalogs = await Catalog.find({ isPublic: true })
      .populate('user', 'username firstName lastName')
      .populate('content', 'title posterUrl type')
      .sort('-updatedAt');

    res.json({
      success: true,
      count: catalogs.length,
      data: catalogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching public catalogs',
      error: error.message
    });
  }
};

module.exports = {
  getUserCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  addContentToCatalog,
  removeContentFromCatalog,
  getPublicCatalogs
};
