// Dayflow HRMS Server Engine - Reload Trigger
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import payrollRoutes from './routes/payroll.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lightweight Request Logger (Skips high-frequency health probes for high concurrency)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && !req.url.endsWith('/health')) {
    console.log(`[${new Date().toISOString().substring(11, 19)}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'Dayflow HRMS API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build in production if built
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, '../../client/dist');

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` 🚀 Dayflow HRMS Backend Engine Live`);
  console.log(` 🌐 Server URL: http://localhost:${PORT}`);
  console.log(` 🩺 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Port ${PORT} Busy] Retrying port binding in 1s...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT);
    }, 1000);
  } else {
    console.error('Server socket error:', err);
  }
});

const cleanup = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
