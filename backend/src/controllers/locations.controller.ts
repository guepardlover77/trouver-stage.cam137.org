// Contrôleur pour les opérations CRUD sur les locations

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import pool from '../config/database.js';
import { createError } from '../middleware/error-handler.js';
import type { Location, LocationInput, ApiResponse, PaginatedResponse } from '../types/index.js';

// Schéma de validation pour une location
const locationSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(255),
  adresse: z.string().min(1, "L'adresse est requise").max(500),
  code_postal: z.string().min(1, 'Le code postal est requis').max(10),
  ville: z.string().min(1, 'La ville est requise').max(100),
  type: z.string().min(1, 'Le type est requis').max(100),
  niveau: z.string().max(20).nullable().optional(),
  telephone: z.string().max(50).nullable().optional(),
  contact: z.string().max(200).nullable().optional(),
  email: z.string().email('Email invalide').max(255).nullable().optional().or(z.literal('')),
  commentaire: z.string().nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lon: z.number().min(-180).max(180).nullable().optional(),
});

const partialLocationSchema = locationSchema.partial();

/**
 * GET /api/v1/locations - Liste toutes les locations
 */
export async function getAllLocations(
  req: Request,
  res: Response<PaginatedResponse<Location>>,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string) || 1000));
    const offset = (page - 1) * limit;

    // Compter le total
    const countResult = await pool.query('SELECT COUNT(*) FROM locations');
    const total = parseInt(countResult.rows[0].count, 10);

    // Récupérer les données
    const result = await pool.query<Location>(
      'SELECT * FROM locations ORDER BY id LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/locations/:id - Récupère une location par ID
 */
export async function getLocationById(
  req: Request,
  res: Response<ApiResponse<Location>>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      throw createError('ID invalide', 400);
    }

    const result = await pool.query<Location>(
      'SELECT * FROM locations WHERE id = $1',
      [numId]
    );

    if (result.rows.length === 0) {
      throw createError('Location non trouvée', 404);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/locations - Crée une nouvelle location
 */
export async function createLocation(
  req: Request,
  res: Response<ApiResponse<Location>>,
  next: NextFunction
): Promise<void> {
  try {
    const validation = locationSchema.safeParse(req.body);

    if (!validation.success) {
      throw createError(
        `Données invalides: ${validation.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const data = validation.data as LocationInput;

    const result = await pool.query<Location>(
      `INSERT INTO locations (nom, adresse, code_postal, ville, type, niveau, telephone, contact, email, commentaire, lat, lon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.nom,
        data.adresse,
        data.code_postal,
        data.ville,
        data.type,
        data.niveau || null,
        data.telephone || null,
        data.contact || null,
        data.email || null,
        data.commentaire || null,
        data.lat ?? null,
        data.lon ?? null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Location créée avec succès',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/v1/locations/:id - Met à jour une location
 */
export async function updateLocation(
  req: Request,
  res: Response<ApiResponse<Location>>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      throw createError('ID invalide', 400);
    }

    const validation = partialLocationSchema.safeParse(req.body);

    if (!validation.success) {
      throw createError(
        `Données invalides: ${validation.error.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    const data = validation.data;

    // Vérifier que la location existe
    const existing = await pool.query('SELECT id FROM locations WHERE id = $1', [numId]);
    if (existing.rows.length === 0) {
      throw createError('Location non trouvée', 404);
    }

    // Construire la requête de mise à jour dynamiquement
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fields: (keyof LocationInput)[] = [
      'nom', 'adresse', 'code_postal', 'ville', 'type', 'niveau',
      'telephone', 'contact', 'email', 'commentaire', 'lat', 'lon'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(data[field] === '' ? null : data[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw createError('Aucune donnée à mettre à jour', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(numId);

    const result = await pool.query<Location>(
      `UPDATE locations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Location mise à jour avec succès',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/locations/:id - Supprime une location
 */
export async function deleteLocation(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      throw createError('ID invalide', 400);
    }

    const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING id', [numId]);

    if (result.rows.length === 0) {
      throw createError('Location non trouvée', 404);
    }

    res.json({
      success: true,
      message: 'Location supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/locations/types - Liste tous les types uniques
 */
export async function getUniqueTypes(
  _req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await pool.query<{ type: string }>(
      'SELECT DISTINCT type FROM locations WHERE type IS NOT NULL ORDER BY type'
    );

    res.json({
      success: true,
      data: result.rows.map((row) => row.type),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/locations/cities - Liste toutes les villes uniques
 */
export async function getUniqueCities(
  _req: Request,
  res: Response<ApiResponse<string[]>>,
  next: NextFunction
): Promise<void> {
  try {
    const result = await pool.query<{ ville: string }>(
      'SELECT DISTINCT ville FROM locations WHERE ville IS NOT NULL ORDER BY ville'
    );

    res.json({
      success: true,
      data: result.rows.map((row) => row.ville),
    });
  } catch (error) {
    next(error);
  }
}
