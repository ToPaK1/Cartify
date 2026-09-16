const productModel = require('../models/productModel');

function getProducts(req, res, next) {
  try { res.json({ success: true, ...productModel.list(req.query) }); } catch (error) { next(error); }
}

function getProduct(req, res, next) {
  try {
    const product = productModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) { next(error); }
}

function validate(body) {
  if (!body.name || !body.slug || body.price === undefined) return 'Name, slug and price are required';
  if (Number(body.price) < 0 || Number(body.stock || 0) < 0) return 'Price and stock cannot be negative';
  return null;
}

function createProduct(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    res.status(201).json({ success: true, product: productModel.create(req.body) });
  } catch (error) { next(error); }
}

function updateProduct(req, res, next) {
  try {
    if (!productModel.findById(req.params.id)) return res.status(404).json({ success: false, message: 'Product not found' });
    const error = validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    res.json({ success: true, product: productModel.update(req.params.id, req.body) });
  } catch (error) { next(error); }
}

function deleteProduct(req, res, next) {
  try {
    const result = productModel.remove(req.params.id);
    if (!result.changes) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) { next(error); }
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
