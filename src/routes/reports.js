import { Router } from 'express';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

const router = Router();

function computeTurnoverRate(totalSold, avgInventory) {
  if (avgInventory <= 0) return 0;
  return Number((totalSold / avgInventory).toFixed(2));
}

router.get('/metrics', async (req, res) => {
  const products = await Product.find();
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const totalSold = products.reduce((s, p) => s + p.totalSold, 0);
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const avgInventory = products.reduce((s, p) => s + p.stock, 0) / (totalProducts || 1);
  const turnoverRate = computeTurnoverRate(totalSold, avgInventory);

  res.json({ totalProducts, totalInventoryValue, totalSold, totalRevenue, turnoverRate });
});

router.get('/sales-trends', async (req, res) => {
  const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const sales = await Sale.find({ date: { $gte: since } }).sort({ date: 1 });
  res.json(sales);
});

router.get('/top-products', async (req, res) => {
  const top = await Product.find().sort({ totalSold: -1 }).limit(10);
  res.json(top);
});

router.get('/low-stock', async (req, res) => {
  const low = await Product.find({ $expr: { $lte: ['$stock', '$threshold'] } }).sort({ stock: 1 });
  res.json(low);
});

export default router;


