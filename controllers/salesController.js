// const SalesTrend = require('../models/salesTrend')
// const TopProduct = require('../models/topProduct')
// const Sale = require('../models/sale')
// const Product = require('../models/product')

// // GET /api/sales?days=180
// async function getSalesSeries(req, res) {
//   try {
//     const days = Math.max(1, parseInt(req.query.days || '180', 10))
//     const end = new Date()
//     const start = new Date()
//     start.setDate(end.getDate() - days)

//     const trends = await SalesTrend.find({
//       date: { $gte: start, $lte: end }
//     }).sort({ date: 1 })

//     const series = trends.map((t) => ({
//       date: t.date.toISOString(),
//       sales: t.revenue ?? t.totalRevenue ?? 0,
//       orders: t.orders ?? t.orderCount ?? 0,
//       inventory: 0,
//     }))
//     return res.json(series)
//   } catch (err) {
//     console.error('getSalesSeries error:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// // GET /api/sales/top?limit=6&by=quantity&days=180
// async function getTopSkus(req, res) {
//   try {
//     const limit = Math.min(100, parseInt(req.query.limit || '6', 10))
//     const by = (req.query.by || 'quantity').toString()

//     const sort = by === 'revenue' ? { totalRevenue: -1 } : { totalQuantity: -1 }
//     const tops = await TopProduct.find({}).sort(sort).limit(limit)

//     const data = tops.map((t) => ({
//       sku: t.sku,
//       name: t.name,
//       sales: t.totalQuantity ?? 0,
//       quantity: t.totalQuantity ?? 0,
//       revenue: t.totalRevenue ?? 0,
//     }))
//     return res.json(data)
//   } catch (err) {
//     console.error('getTopSkus error:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// // This seems to be a duplicate of getTopSkus, but with a different name.
// // The routes file uses both, so I'm keeping both and exporting them.
// // You might want to consolidate them into a single function.
// async function getTopSKUs(req, res) {
//   // Forwarding to getTopSkus to avoid code duplication
//   return getTopSkus(req, res)
// }

// exports.createSales = async (req, res) => {
//   try {
//     const body = req.body
//     const rows = Array.isArray(body) ? body : body.rows || [body]
//     if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: 'No sales provided' })

//     const toInsert = rows.map((r) => ({
//       date: r.date ? new Date(r.date) : new Date(),
//       sku: r.sku,
//       quantity: Number(r.quantity) || 0,
//       revenue: Number(r.revenue) || 0
//     }))

//     const invalid = toInsert.filter((s) => !s.sku || isNaN(s.quantity) || isNaN(s.revenue))
//     if (invalid.length) return res.status(400).json({ error: 'Some rows are invalid', details: invalid })

//     const result = await Sale.insertMany(toInsert)
//     return res.json({ ok: true, inserted: result.length })
//   } catch (err) {
//     console.error('Error inserting sales:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// exports.getAggregatedSales = async (req, res) => {
//   try {
//     const days = Math.max(1, Number(req.query.days) || 30)
//     const now = new Date()
//     const start = new Date(now)
//     start.setHours(0, 0, 0, 0)
//     start.setDate(start.getDate() - (days - 1))

//     const agg = await Sale.aggregate([
//       { $match: { date: { $gte: start } } },
//       {
//         $group: {
//           _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
//           totalRevenue: { $sum: '$revenue' },
//           totalQuantity: { $sum: '$quantity' }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ])

//     const invAgg = await Product.aggregate([{ $group: { _id: null, totalStock: { $sum: '$stock' } } }])
//     const totalStock = invAgg && invAgg.length ? (invAgg[0].totalStock || 0) : 0

//     const series = []
//     for (let i = 0; i < days; i++) {
//       const d = new Date(start)
//       d.setDate(start.getDate() + i)
//       const key = d.toISOString().slice(0, 10)
//       const found = agg.find((a) => a._id === key)
//       const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//   series.push({ date: label, sales: found ? found.totalRevenue : 0, orders: found ? found.totalQuantity : 0, inventory: totalStock })
//     }

//     return res.json(series)
//   } catch (err) {
//     console.error('Error fetching sales:', err)
//     return res.status(500).json({ error: String(err) })
//   }
// }

// module.exports = {
//   getSalesSeries,
//   getTopSkus,
//   createSales: exports.createSales,
//   getAggregatedSales: exports.getAggregatedSales,
//   getTopSKUs
// }



import SalesTrend from "../models/salesTrend.js";
import TopProduct from "../models/topProduct.js";
import Sale from "../models/sale.js";
import Product from "../models/product.js";

// ✅ GET /api/sales?days=180 - Returns combined trends and topProducts
// Derives data from sales collection so UI shows all inserted sales
export async function getSalesSeries(req, res) {
  try {
    const days = Math.max(1, parseInt(req.query.days || "180", 10));
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    // 1) Build trends from sales collection: group by month, sum revenue, sum quantity (as orders)
    const trendsFromSales = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          revenue: { $sum: "$revenue" },
          orders: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
    const trendsArray = trendsFromSales.map((row) => {
      const [y, m] = row._id.split("-").map(Number);
      const monthLabel = `${monthNames[m - 1]} ${y}`;
      return {
        month: monthLabel,
        revenue: row.revenue ?? 0,
        orders: row.orders ?? 0,
      };
    });

    // 2) Build top products from sales collection: group by sku, sum quantity; resolve name from Product
    const limit = 10;
    const topBySku = await Sale.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$sku",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$revenue" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    const skus = topBySku.map((r) => r._id).filter(Boolean);
    const productsBySku = await Product.find({ sku: { $in: skus } }).select("sku name").lean();
    const nameBySku = Object.fromEntries(productsBySku.map((p) => [p.sku, p.name]));

    const topProducts = topBySku.map((t) => ({
      sku: t._id,
      name: nameBySku[t._id] || t._id,
      sales: t.totalQuantity ?? 0,
    }));

    return res.json({
      trends: trendsArray,
      topProducts: topProducts,
    });
  } catch (err) {
    console.error("getSalesSeries error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ GET /api/sales/top?limit=6&by=quantity&days=180
export async function getTopSkus(req, res) {
  try {
    const limit = Math.min(100, parseInt(req.query.limit || "6", 10));
    const by = (req.query.by || "quantity").toString();

    const sort = by === "revenue" ? { totalRevenue: -1 } : { totalQuantity: -1 };
    const tops = await TopProduct.find({}).sort(sort).limit(limit);

    const data = tops.map((t) => ({
      sku: t.sku,
      name: t.name || t.sku, // Fallback to SKU if name not available
      sales: t.totalQuantity ?? 0,
      quantity: t.totalQuantity ?? 0,
      revenue: t.totalRevenue ?? 0,
    }));

    return res.json(data);
  } catch (err) {
    console.error("getTopSkus error:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ Duplicate function kept for compatibility
export async function getTopSKUs(req, res) {
  return getTopSkus(req, res);
}

// ✅ POST /api/sales
export async function createSales(req, res) {
  try {
    const body = req.body;
    const rows = Array.isArray(body) ? body : body.rows || [body];

    if (!Array.isArray(rows) || rows.length === 0)
      return res.status(400).json({ error: "No sales provided" });

    const toInsert = rows.map((r) => ({
      date: r.date ? new Date(r.date) : new Date(),
      sku: r.sku,
      quantity: Number(r.quantity) || 0,
      revenue: Number(r.revenue) || 0,
    }));

    const invalid = toInsert.filter(
      (s) => !s.sku || isNaN(s.quantity) || isNaN(s.revenue)
    );

    if (invalid.length)
      return res
        .status(400)
        .json({ error: "Some rows are invalid", details: invalid });

    const result = await Sale.insertMany(toInsert);
    return res.json({ ok: true, inserted: result.length });
  } catch (err) {
    console.error("Error inserting sales:", err);
    return res.status(500).json({ error: String(err) });
  }
}

// ✅ GET /api/sales/aggregate
export async function getAggregatedSales(req, res) {
  try {
    const days = Math.max(1, Number(req.query.days) || 30);
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const agg = await Sale.aggregate([
      { $match: { date: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalRevenue: { $sum: "$revenue" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const invAgg = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: "$stock" } } },
    ]);

    const totalStock =
      invAgg && invAgg.length ? invAgg[0].totalStock || 0 : 0;

    const series = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const found = agg.find((a) => a._id === key);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      series.push({
        date: label,
        sales: found ? found.totalRevenue : 0,
        orders: found ? found.totalQuantity : 0,
        inventory: totalStock,
      });
    }

    return res.json(series);
  } catch (err) {
    console.error("Error fetching sales:", err);
    return res.status(500).json({ error: String(err) });
  }
}

export default {
  getSalesSeries,
  getTopSkus,
  createSales,
  getAggregatedSales,
  getTopSKUs,
};
