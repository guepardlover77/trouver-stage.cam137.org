// Agrégateur de routes

import { Router } from 'express';
import locationsRouter from './locations.js';
import { verifyAdminCode } from '../middleware/auth.js';

const router = Router();

// Routes pour les locations
router.use('/locations', locationsRouter);

// Route pour vérifier le code admin
router.post('/auth/verify', verifyAdminCode);

// Route de santé pour vérifier que l'API fonctionne
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
