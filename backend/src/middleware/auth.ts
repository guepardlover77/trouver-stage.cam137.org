// Middleware d'authentification admin

import { Request, Response, NextFunction } from 'express';

const ADMIN_CODE = process.env.ADMIN_CODE || 'admin2024';

export interface AuthenticatedRequest extends Request {
  isAdmin?: boolean;
}

/**
 * Middleware pour vérifier le code admin
 * Le code peut être envoyé via:
 * - Header: X-Admin-Code
 * - Body: adminCode
 * - Query: adminCode
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const adminCode =
    req.headers['x-admin-code'] ||
    req.body?.adminCode ||
    req.query?.adminCode;

  if (!adminCode) {
    res.status(401).json({
      success: false,
      error: 'Code admin requis',
    });
    return;
  }

  if (adminCode !== ADMIN_CODE) {
    res.status(403).json({
      success: false,
      error: 'Code admin invalide',
    });
    return;
  }

  req.isAdmin = true;
  next();
}

/**
 * Endpoint pour vérifier un code admin
 */
export function verifyAdminCode(req: Request, res: Response): void {
  const { code } = req.body;

  if (!code) {
    res.status(400).json({
      success: false,
      error: 'Code requis',
    });
    return;
  }

  if (code === ADMIN_CODE) {
    res.json({
      success: true,
      message: 'Code admin valide',
    });
  } else {
    res.status(403).json({
      success: false,
      error: 'Code admin invalide',
    });
  }
}
