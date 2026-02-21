import express from 'express';
const router = express.Router();
import reportsController from '../controllers/reportsController.js';

// GET /api/reports/dashboard - Get dashboard stats
router.get('/dashboard', reportsController.getDashboardStats);

// GET /api/reports/sales - Get sales report
router.get('/sales', reportsController.getSalesReport);

// GET /api/reports/inventory - Get inventory report
router.get('/inventory', reportsController.getInventoryReport);

// GET /api/reports/top-products - Get top products report
router.get('/top-products', reportsController.getTopProductsReport);

// GET /api/reports/billing - Get billing report
router.get('/billing', reportsController.getBillingReport);

export default router;