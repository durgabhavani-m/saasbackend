// const express = require('express')
// const router = express.Router()
// const { getProducts, bulkUpsert } = require('../controllers/productController')

// // Mounted at /api/products in server.js
// router.get('/', getProducts)
// router.post('/bulk', bulkUpsert)

// module.exports = router


// // backend/routes/productRoutes.js
// import express from "express";
// import { getProducts, bulkUpsert } from "../controllers/productController.js";

// const router = express.Router();

// // Mounted at /api/products in server.js
// router.get("/", getProducts);
// router.post("/bulk", bulkUpsert);

// export default router; // 👈 ES module export


import express from "express";
import { getProducts, bulkUpsert, getLowStockProducts } from "../controllers/productController.js";

const router = express.Router();

// Mounted at /api/products
router.get("/", getProducts);
router.get("/low-stock", getLowStockProducts);
router.post("/bulk", bulkUpsert);

export default router;
