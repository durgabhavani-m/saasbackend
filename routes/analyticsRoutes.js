// const express = require('express')
// const router = express.Router()
// const {
//   getTopProducts,
//   getTrends,
//   recordSale
// } = require('../controllers/analyticsController')

// router.get('/top-products', getTopProducts)
// router.get('/trends', getTrends)
// router.post('/sales', recordSale)

// module.exports = router


// import express from "express";
// import { getAnalytics } from "../controllers/analyticsController.js";

// const router = express.Router();

// router.get("/", getAnalytics);

// export default router;


import express from "express";
import { getTopProducts, getTrends, recordSale, getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/", getAnalytics); // Root route for /api/analytics
router.get("/top-products", getTopProducts);
router.get("/trends", getTrends);
router.post("/sales", recordSale);

export default router;
