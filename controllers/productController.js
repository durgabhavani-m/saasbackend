// const Product = require('../models/product')

// async function getProducts(req, res) {
//   try {
//     const products = await Product.find({}).sort({ createdAt: -1 })
//     return res.json(products)
//   } catch (err) {
//     console.error('getProducts error:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// async function bulkUpsert(req, res) {
//   console.log('Received POST /api/products/bulk body:', JSON.stringify(req.body))
//   try {
//     const rows = req.body && req.body.rows
//     if (!Array.isArray(rows) || rows.length === 0) {
//       return res.status(400).json({ error: 'No rows provided' })
//     }

//     const validationErrors = []
//     const sanitized = rows.filter((p, i) => {
//       if (!p || !p.name || !p.sku) {
//         validationErrors.push(`Row ${i + 1}: name and sku are required`)
//         return false
//       }
//       return true
//     })
//     if (sanitized.length === 0) {
//       return res.status(400).json({ error: 'All rows invalid', details: validationErrors })
//     }

//     const ops = sanitized.map((p) => ({
//       updateOne: {
//         filter: { sku: p.sku },
//         update: {
//           $set: {
//             name: p.name,
//             category: p.category,
//             price: p.price,
//             stock: p.stock,
//           },
//         },
//         upsert: true,
//       },
//     }))

//     const result = await Product.bulkWrite(ops, { ordered: false })
//     const payload = { ok: true, result }
//     if (validationErrors.length > 0) {
//       payload.partial = true
//       payload.errors = validationErrors
//     }
//     return res.json(payload)
//   } catch (err) {
//     console.error('bulkUpsert error:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// module.exports = { getProducts, bulkUpsert }



import Product from "../models/product.js";

// ✅ GET /api/products
export async function getProducts(req, res) {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error("getProducts error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ POST /api/products/bulk
export async function bulkUpsert(req, res) {
  console.log("Received POST /api/products/bulk body:", JSON.stringify(req.body));

  try {
    const rows = req.body && req.body.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "No rows provided" });
    }

    const validationErrors = [];
    const sanitized = rows.filter((p, i) => {
      if (!p || !p.name || !p.sku) {
        validationErrors.push(`Row ${i + 1}: name and sku are required`);
        return false;
      }
      return true;
    });

    if (sanitized.length === 0) {
      return res
        .status(400)
        .json({ error: "All rows invalid", details: validationErrors });
    }

    const ops = sanitized.map((p) => ({
      updateOne: {
        filter: { sku: p.sku },
        update: {
          $set: {
            name: p.name,
            category: p.category,
            price: p.price,
          },
          $inc: {
            stock: p.stock,
          },
          $setOnInsert: {
            minStock: 0,
          },
        },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(ops, { ordered: false });
    const payload = { ok: true, result };

    if (validationErrors.length > 0) {
      payload.partial = true;
      payload.errors = validationErrors;
    }

    return res.json(payload);
  } catch (err) {
    console.error("bulkUpsert error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ GET /api/products/low-stock
export async function getLowStockProducts(req, res) {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$minStock'] }
    }).sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error("getLowStockProducts error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ Default export for flexibility (optional)
export default { getProducts, bulkUpsert, getLowStockProducts };
