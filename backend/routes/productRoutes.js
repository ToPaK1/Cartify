const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

module.exports = router;
