import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { nanoid } from 'nanoid';
import { Readable } from 'stream';
import Product from '../../models/product.js';
import Sale from '../../models/sale.js';
import ActivityLog from '../../src/models/ActivityLog.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

async function recordSale({ product, quantity, price, date, invoiceNumber }) {
  const total = quantity * price;

  // Update product stock and aggregates
  product.stock = Math.max(0, product.stock - quantity);
  product.totalSold += quantity;
  product.revenue += total;
  await product.save();

  console.log('Creating sale with:', { date, sku: product.sku, quantity, revenue: total });
  console.log('Product object:', product);
  const sale = await Sale.create({
    date,
    sku: product.sku,
    quantity,
    revenue: total
  });

  console.log('Sale created:', sale);

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

// Create a single bill (sale)
router.post('/bill', async (req, res) => {
  const { productId, quantity, date } = req.body;
  if (!productId || !quantity) return res.status(400).json({ error: 'productId and quantity required' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const invoiceNumber = `INV-${nanoid(8)}`;
  const sale = await recordSale({ product, quantity, price: product.price, date: date ? new Date(date) : new Date(), invoiceNumber });
  res.json({ sale, product });
});

// Save billing data
router.post('/', async (req, res) => {
  try {
    const { customer, items, subtotal, discount, tax, totalAmount, notes, paymentMethod, status } = req.body;

    if (!customer || !customer.name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and billing items are required' });
    }

    // Generate bill number
    const billNumber = `BILL-${nanoid(8)}`;

    // Process each item - find product by name and create sales
    const processedItems = [];
    let totalProcessed = 0;

    for (const item of items) {
      const product = await Product.findOne({ name: item.product });
      if (!product) {
        return res.status(404).json({ error: `Product "${item.product}" not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${item.product}". Available: ${product.stock}, Requested: ${item.quantity}` });
      }

      // Record the sale
      const invoiceNumber = `BILL-${billNumber}-${nanoid(4)}`;
      const sale = await recordSale({
        product,
        quantity: item.quantity,
        price: item.price,
        date: new Date(),
        invoiceNumber
      });

      processedItems.push({
        productId: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        saleId: sale._id
      });

      totalProcessed += item.total;
    }

    // Create billing record (you might want to create a Billing model for this)
    const billingData = {
      billNumber,
      customer,
      items: processedItems,
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      totalAmount,
      notes: notes || '',
      paymentMethod: paymentMethod || 'cash',
      status: status || 'completed',
      createdAt: new Date()
    };

    // For now, just return success - you can save to a Billing collection later
    res.json({
      billNumber,
      message: 'Billing saved successfully',
      totalItems: processedItems.length,
      totalAmount: totalProcessed,
      billingData
    });

  } catch (error) {
    console.error('Error saving billing:', error);
    res.status(500).json({ error: error.message || 'Failed to save billing' });
  }
});

// Bulk CSV upload for billing: columns product_name, quantity_sold, price (optional), date (optional)
router.post('/bulk-csv', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file required under field "file"' });

  const rows = [];
  const buffer = req.file.buffer;
  await new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  const items = [];
  let totalAmount = 0;
  for (const row of rows) {
    // Support multiple column name variations
    const name = (row.product_name || row.productName || row.name || row.Product || row['Product Name'])?.toString().trim();
    const qty = Number(row.quantity_sold || row.quantitySold || row.quantity || row.qty || row.Quantity || row['Quantity Sold']);
    const price = row.price ? Number(row.price) : (row.Price ? Number(row.Price) : undefined);

    console.log('Processing row:', { name, qty, price, row }); // Debug log

    if (!name || !qty || Number.isNaN(qty)) {
      console.log('Skipping row due to missing/invalid data');
      continue;
    }

    const product = await Product.findOne({ name });
    if (!product) {
      console.log(`Product "${name}" not found`);
      continue;
    }

    if (product.stock < qty) {
      return res.status(400).json({ error: `Insufficient stock for "${name}". Available: ${product.stock}, Requested: ${qty}` });
    }

    const itemPrice = price || product.price;
    const total = qty * itemPrice;
    items.push({
      productName: name,
      quantity: qty,
      price: itemPrice,
      total
    });
    totalAmount += total;
  }

  console.log(`Processed ${items.length} items from CSV`); // Debug log

  res.json({ items, totalAmount, message: `CSV processed successfully! ${items.length} items loaded.` });
});

export default router;


