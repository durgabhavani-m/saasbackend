


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB } from "./db.js";

// Routes
import productRoutes from "./routes/productRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // 🔥 Use your new auth routes here
import reportRoutes from "./routes/reportRoutes.js";
import billingRouter from "./src/routes/billing.js";

dotenv.config();

const app = express();

// 🌍 CORS - Allow frontend on Vercel + local dev (comma-separated origins)
const origins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const corsOptions = {
  origin: origins.length > 1 ? origins : origins[0] || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// 🧩 Middleware
app.use(express.json());
app.use(morgan("dev"));

// 🛣️ Routes
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes); // ✅ Auth route integrated
app.use("/api/reports", reportRoutes);
app.use("/api/billing", billingRouter);

// 💓 Health Check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is healthy 🚀", timestamp: Date.now() });
});

// 🚀 Start the Server with port fallback when port is already in use
const startServer = async () => {
  try {
    await connectDB();

    let port = parseInt(process.env.PORT, 10) || 5000;
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          const server = app.listen(port, "0.0.0.0", () => {
            console.log(`✅ Server running at: http://localhost:${port}`);
            resolve(server);
          });

          server.on("error", (err) => {
            reject(err);
          });
        });
        // If we reach here, the server started successfully
        return;
      } catch (err) {
        if (err && err.code === "EADDRINUSE") {
          console.warn(`⚠️ Port ${port} in use — trying port ${port + 1}`);
          port += 1; // try next port
          continue;
        }
        // Unknown error — rethrow
        throw err;
      }
    }

    console.error(`❌ Could not bind to any port in range ${port - maxAttempts + 1}..${port}`);
    process.exit(1);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
