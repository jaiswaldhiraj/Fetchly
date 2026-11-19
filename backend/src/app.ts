import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { helmetMiddleware, sanitizeBody } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import analyzeRouter from './routes/analyze';
import downloadRouter from './routes/download';
import audioRouter from './routes/audio';
import historyRouter from './routes/history';
import adminRouter from './routes/admin';

const app = express();

// ─────────────────────────────────────────────────────────
//  Core Middleware
// ─────────────────────────────────────────────────────────
app.use(helmetMiddleware);
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'Admin-Key'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(sanitizeBody);

// ─────────────────────────────────────────────────────────
//  Health Check
// ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─────────────────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeRouter);
app.use('/api/download', downloadRouter);
app.use('/api/audio', audioRouter);
app.use('/api/history', historyRouter);
app.use('/api/admin', adminRouter);

// ─────────────────────────────────────────────────────────
//  Error Handlers (must be last)
// ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
