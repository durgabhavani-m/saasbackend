import Sale from '../models/sale.js';
import Product from '../models/product.js';
import Billing from '../models/billing.js';

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;

    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sales = await Sale.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'monthly' ? '%Y-%m' : period === 'yearly' ? '%Y' : '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$finalAmount' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get inventory report
const getInventoryReport = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          lowStock: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$minStock'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalInventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      }
    ]);

    res.json({
      byCategory: products,
      totalValue: totalInventoryValue[0]?.totalValue || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top products report
const getTopProductsReport = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;

    let matchCondition = {};
    if (period) {
      const startDate = new Date();
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      matchCondition.date = { $gte: startDate };
    }

    // Group sales by sku
    const topProducts = await Sale.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$sku',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$revenue' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'sku',
          as: 'product'
        }
      },
      { $match: { 'product.0': { $exists: true } } },
      { $unwind: '$product' },
      {
        $project: {
          _id: '$product._id',
          sku: '$product.sku',
          name: '$product.name',
          category: '$product.category',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Return plain array for frontend compatibility
    res.json(topProducts);
  } catch (error) {
    console.error('Error in getTopProductsReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get billing report
const getBillingReport = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;

    let matchCondition = {};
    if (status) matchCondition.status = status;
    if (paymentStatus) matchCondition.paymentStatus = paymentStatus;

    const bills = await Billing.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalProducts,
      lowStockProducts,
      todaySales,
      totalSales,
      pendingBills
    ] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({
        $expr: { $lte: ['$stock', '$minStock'] },
        status: 'active'
      }),
      Sale.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Billing.countDocuments({ paymentStatus: 'pending' })
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      todaySales: todaySales[0]?.total || 0,
      totalSales: totalSales[0]?.total || 0,
      pendingBills
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getSalesReport,
  getInventoryReport,
  getTopProductsReport,
  getBillingReport,
  getDashboardStats
};