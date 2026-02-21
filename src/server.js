import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import productsRouter from './routes/products.js';
import billingRouter from './routes/billing.js';
import reportsRouter from './routes/reports.js';
import salesRouter from './routes/sales.js';
import authRouter from './routes/auth.js';
import activityRouter from './routes/activity.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory_saas';
mongoose
  .connect(mongoUri, { autoIndex: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error', err));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api/products', productsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/auth', authRouter);
app.use('/api/activity', activityRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on :${port}`));


