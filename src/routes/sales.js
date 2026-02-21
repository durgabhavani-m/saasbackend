import { Router } from 'express';
import { nanoid } from 'nanoid';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import ActivityLog from '../models/ActivityLog.js';
import multer from 'multer';
import csv from 'csv-parser';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function recordSale({ product, quantity, price, date, invoiceNumber }) {
  if (quantity <= 0) throw new Error('Quantity must be > 0');
  if (product.stock < quantity) throw new Error('Insufficient stock');

  const total = quantity * price;
  product.stock -= quantity;
  product.totalSold += quantity;
  product.revenue += total;
  await product.save();

  const sale = await Sale.create({
    productId: product._id,
    productName: product.name,
    quantity,
    price,
    total,
    date,
    invoiceNumber
  });

  await ActivityLog.create({
    productId: product._id,
    productName: product.name,
    action: 'SALE',
    quantity,
    remainingStock: product.stock,
    date
  });
  return sale;
}

// POST /api/sales  { items: [{ productId, quantity, price? }] }
router.post('/', async (req, res) => {
  const { items, date } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });

  const invoiceNumber = `INV-${nanoid(8)}`;
  const results = [];
  for (const it of items) {
    const product = await Product.findById(it.productId);
    if (!product) { results.push({ ok: false, error: 'Product not found', item: it }); continue; }
    try {
      const sale = await recordSale({ product, quantity: Number(it.quantity), price: it.price ?? product.price, date: date ? new Date(date) : new Date(), invoiceNumber });
      results.push({ ok: true, sale, remainingStock: product.stock });
    } catch (e) {
      results.push({ ok: false, error: e.message, item: it, remainingStock: product.stock });
    }
  }
  const okCount = results.filter(r => r.ok).length;
  res.json({ invoiceNumber, ok: okCount, total: results.length, results });
});

// POST /api/sales/bulk  CSV upload
router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required' });
  const rows = [];
  const buffer = req.file.buffer;
  await new Promise((resolve, reject) => {
    const stream = require('stream');
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable
      .pipe(csv())
      .on('data', (d) => rows.push(d))
      .on('end', resolve)
      .on('error', reject);
  });
  const invoiceNumber = `BULK-${nanoid(6)}`;
  const summary = { processed: 0, success: 0, errors: 0, rows: [] };
  for (const r of rows) {
    summary.processed++;
    const name = (r.product_name || r.product || '').toString().trim();
    const qty = Number(r.quantity_sold || r.quantity || 0);
    const d = r.date ? new Date(r.date) : new Date();
    const product = await Product.findOne({ name });
    if (!product) { summary.errors++; summary.rows.push({ ok:false, name, error: 'Product not found' }); continue; }
    try {
      await recordSale({ product, quantity: qty, price: product.price, date: d, invoiceNumber });
      summary.success++; summary.rows.push({ ok:true, name, qty, remainingStock: product.stock });
    } catch (e) {
      summary.errors++; summary.rows.push({ ok:false, name, error: e.message, remainingStock: product.stock });
    }
  }
  res.json({ invoiceNumber, summary });
});

export default router;


