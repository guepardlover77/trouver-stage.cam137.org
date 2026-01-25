// Configuration et pool de connexion PostgreSQL

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'carte_stages',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Initialisation du schéma de la base de données
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        adresse VARCHAR(500) NOT NULL,
        code_postal VARCHAR(10) NOT NULL,
        ville VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        niveau VARCHAR(20),
        telephone VARCHAR(50),
        contact VARCHAR(200),
        email VARCHAR(255),
        commentaire TEXT,
        lat DECIMAL(10, 7),
        lon DECIMAL(10, 7),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Index pour les recherches
      CREATE INDEX IF NOT EXISTS idx_locations_ville ON locations(ville);
      CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(type);
      CREATE INDEX IF NOT EXISTS idx_locations_code_postal ON locations(code_postal);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
