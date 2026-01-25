// Routes pour les locations

import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getUniqueTypes,
  getUniqueCities,
} from '../controllers/locations.controller.js';

const router = Router();

// Routes publiques (lecture)
router.get('/', getAllLocations);
router.get('/types', getUniqueTypes);
router.get('/cities', getUniqueCities);
router.get('/:id', getLocationById);

// Routes protégées (écriture) - nécessitent le code admin
router.post('/', requireAdmin, createLocation);
router.put('/:id', requireAdmin, updateLocation);
router.delete('/:id', requireAdmin, deleteLocation);

export default router;
