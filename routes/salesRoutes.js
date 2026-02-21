// const express = require('express')
// const router = express.Router()
// const {
//   getSalesSeries,
//   getTopSkus,
//   createSales,
//   getAggregatedSales,
//   getTopSKUs
// } = require('../controllers/salesController')

// router.get('/', getSalesSeries)
// router.get('/top', getTopSkus)
// router.post('/', createSales)

// module.exports = router


import express from "express";
import {
  getSalesSeries,
  getTopSkus,
  createSales,
  getAggregatedSales,
  getTopSKUs,
} from "../controllers/salesController.js";

const router = express.Router();

router.get("/", getSalesSeries);
router.get("/top", getTopSkus);
router.post("/", createSales);

export default router;

