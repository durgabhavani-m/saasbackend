// const SalesTrend = require('../models/salesTrend')
// const TopProduct = require('../models/topProduct')
// const Sale = require('../models/sale')

// // GET /api/analytics/top-products?sortBy=revenue|quantitySold&limit=10
// async function getTopProducts(req, res) {
//   try {
//     const sortBy = (req.query.sortBy || 'revenue').toString()
//     const limit = Math.min(100, parseInt(req.query.limit || '10', 10))
//     const sort = sortBy === 'quantitySold' ? { totalQuantity: -1 } : { totalRevenue: -1 }

//     const tops = await TopProduct.find({}).sort(sort).limit(limit)
//     const data = tops.map((t) => ({
//       name: t.name,
//       revenue: t.totalRevenue ?? 0,
//       quantitySold: t.totalQuantity ?? 0,
//     }))
//     return res.json({ success: true, data })
//   } catch (err) {
//     console.error('getTopProducts error:', err)
//     return res.status(500).json({ success: false, error: String(err) })
//   }
// }

// // GET /api/analytics/trends?startDate=...&endDate=...
// async function getTrends(req, res) {
//   try {
//     const start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 86400000)
//     const end = req.query.endDate ? new Date(req.query.endDate) : new Date()

//     const trends = await SalesTrend.find({ date: { $gte: start, $lte: end } }).sort({ date: 1 })
//     const data = trends.map((t) => {
//       const totalRevenue = t.revenue ?? t.totalRevenue ?? 0
//       const orderCount = t.orders ?? t.orderCount ?? 0
//       const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
//       return {
//         date: t.date.toISOString(),
//         totalRevenue,
//         orderCount,
//         averageOrderValue,
//       }
//     })
//     return res.json({ success: true, data })
//   } catch (err) {
//     console.error('getTrends error:', err)
//     return res.status(500).json({ success: false, error: String(err) })
//   }
// }

// // Record a new sale and update trends/top products
// async function recordSale(req, res) {
//   try {
//     const sale = req.body
//     if (!sale.sku || !sale.quantity || !sale.revenue) {
//       return res.status(400).json({ error: 'Missing required fields' })
//     }

//     const newSale = new Sale({
//       date: sale.date || new Date(),
//       sku: sale.sku,
//       quantity: sale.quantity,
//       revenue: sale.revenue,
//     })
//     await newSale.save()

//     const trendDate = new Date(newSale.date)
//     trendDate.setHours(0, 0, 0, 0)

//     await SalesTrend.findOneAndUpdate({ date: trendDate }, {
//       $inc: {
//         revenue: sale.revenue,
//         orders: sale.quantity,
//         orderCount: 1,
//       },
//     }, { upsert: true })

//     await TopProduct.findOneAndUpdate(
//       { sku: sale.sku },
//       {
//         $inc: {
//           totalQuantity: sale.quantity,
//           totalRevenue: sale.revenue
//         },
//         $set: {
//           lastUpdated: new Date(),
//           name: sale.productName, // if provided
//         },
//       },
//       { upsert: true })

//     res.json({ ok: true })
//   } catch (err) {
//     console.error('Error recording sale:', err)
//     res.status(500).json({ error: String(err) })
//   }
// }

// module.exports = { getTopProducts, getTrends, recordSale }


// import Sale from "../models/sale.js";

// export const getAnalytics = async (req, res) => {
//   try {
//     // Aggregate daily sales and stock trends
//     const analytics = await Sale.aggregate([
//       {
//         $group: {
//           _id: { $dateToString: { format: "%b %d", date: "$date" } },
//           sales: { $sum: "$revenue" },
//           inventory: { $sum: "$quantity" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const formatted = analytics.map(item => ({
//       date: item._id,
//       sales: item.sales,
//       inventory: item.inventory,
//     }));

//     res.status(200).json(formatted);
//   } catch (error) {
//     console.error("Error fetching analytics:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


import SalesTrend from "../models/salesTrend.js";
import TopProduct from "../models/topProduct.js";
import Sale from "../models/sale.js";

// ✅ GET /api/analytics/top-products?sortBy=revenue|quantitySold&limit=10
export async function getTopProducts(req, res) {
  try {
    const sortBy = (req.query.sortBy || "revenue").toString();
    const limit = Math.min(100, parseInt(req.query.limit || "10", 10));
    const sort =
      sortBy === "quantitySold" ? { totalQuantity: -1 } : { totalRevenue: -1 };

    const tops = await TopProduct.find({}).sort(sort).limit(limit);

    const data = tops.map((t) => ({
      name: t.name,
      revenue: t.totalRevenue ?? 0,
      quantitySold: t.totalQuantity ?? 0,
    }));

    // Return plain array for frontend compatibility
    return res.json(data);
  } catch (err) {
    console.error("getTopProducts error:", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}

// ✅ GET /api/analytics/trends?startDate=...&endDate=...
export async function getTrends(req, res) {
  try {
    const start = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 30 * 86400000);
    const end = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const trends = await SalesTrend.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const data = trends.map((t) => {
      const totalRevenue = t.revenue ?? t.totalRevenue ?? 0;
      const orderCount = t.orders ?? t.orderCount ?? 0;
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      return {
        date: t.date.toISOString(),
        totalRevenue,
        orderCount,
        averageOrderValue,
      };
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getTrends error:", err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}

// ✅ POST /api/analytics/record-sale
export async function recordSale(req, res) {
  try {
    const sale = req.body;
    if (!sale.sku || !sale.quantity || !sale.revenue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSale = new Sale({
      date: sale.date || new Date(),
      sku: sale.sku,
      quantity: sale.quantity,
      revenue: sale.revenue,
    });

    await newSale.save();

    const trendDate = new Date(newSale.date);
    trendDate.setHours(0, 0, 0, 0);

    await SalesTrend.findOneAndUpdate(
      { date: trendDate },
      {
        $inc: {
          revenue: sale.revenue,
          orders: sale.quantity,
          orderCount: 1,
        },
      },
      { upsert: true }
    );

    await TopProduct.findOneAndUpdate(
      { sku: sale.sku },
      {
        $inc: {
          totalQuantity: sale.quantity,
          totalRevenue: sale.revenue,
        },
        $set: {
          lastUpdated: new Date(),
          name: sale.productName, // optional if provided
        },
      },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error recording sale:", err);
    res.status(500).json({ error: String(err) });
  }
}

// ✅ Additional endpoint (already in your last snippet)
export const getAnalytics = async (req, res) => {
  try {
    const analytics = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$date" } },
          sales: { $sum: "$revenue" },
          inventory: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = analytics.map((item) => ({
      date: item._id,
      sales: item.sales,
      inventory: item.inventory,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Default export for flexibility
export default {
  getTopProducts,
  getTrends,
  recordSale,
  getAnalytics,
};
