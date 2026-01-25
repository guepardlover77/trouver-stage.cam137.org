// Point d'entrée de l'API

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { initializeDatabase } from './config/database.js';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

// Middlewares de sécurité et parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Admin-Code'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes en développement
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes API
app.use('/api/v1', routes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
async function start(): Promise<void> {
  try {
    // Initialiser la base de données
    await initializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
