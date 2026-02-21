import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// List all products
router.get('/', async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

// Create or upsert product
router.post('/', async (req, res) => {
  const { name, price, stock, threshold } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name and price required' });
  const product = await Product.findOneAndUpdate(
    { name },
    { name, price, stock: stock ?? 0, threshold: threshold ?? 5 },
    { new: true, upsert: true }
  );
  res.json(product);
});

// Delete a product by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const found = await Product.findById(id);
  if (!found) return res.status(404).json({ error: 'Product not found' });
  await Product.deleteOne({ _id: id });
  res.json({ ok: true });
});

export default router;


