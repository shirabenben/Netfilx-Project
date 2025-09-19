const express = require('express');
const router = express.Router();
const {
  getUserCatalogs,
  getCatalogById,
  createCatalog,
  updateCatalog,
  deleteCatalog,
  addContentToCatalog,
  removeContentFromCatalog,
  getPublicCatalogs
} = require('../controllers/catalogController');

// GET /api/catalogs/public - Get all public catalogs
router.get('/public', getPublicCatalogs);

// GET /api/catalogs/user/:userId - Get all catalogs for a user
router.get('/user/:userId', getUserCatalogs);

// GET /api/catalogs/:id - Get catalog by ID
router.get('/:id', getCatalogById);

// POST /api/catalogs - Create new catalog
router.post('/', createCatalog);

// PUT /api/catalogs/:id - Update catalog
router.put('/:id', updateCatalog);

// DELETE /api/catalogs/:id - Delete catalog
router.delete('/:id', deleteCatalog);

// POST /api/catalogs/:id/content - Add content to catalog
router.post('/:id/content', addContentToCatalog);

// DELETE /api/catalogs/:id/content/:contentId - Remove content from catalog
router.delete('/:id/content/:contentId', removeContentFromCatalog);

module.exports = router;
