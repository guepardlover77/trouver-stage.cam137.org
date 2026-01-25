// Script de migration: data.json -> PostgreSQL

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool, { initializeDatabase } from '../config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LegacyLocation {
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  type: string;
  niveau: string;
  telephone: string;
  contact: string;
  email: string;
  commentaire: string;
  lat: number | null;
  lon: number | null;
}

async function migrate(): Promise<void> {
  console.log('Starting migration from data.json to PostgreSQL...');

  // Chemin vers data.json (à la racine du projet)
  const dataPath = path.resolve(__dirname, '../../../../data.json');

  if (!fs.existsSync(dataPath)) {
    console.error(`File not found: ${dataPath}`);
    console.log('Trying alternative path...');

    const altPath = path.resolve(process.cwd(), '../data.json');
    if (!fs.existsSync(altPath)) {
      console.error(`File not found: ${altPath}`);
      process.exit(1);
    }
  }

  const dataFile = fs.existsSync(dataPath)
    ? dataPath
    : path.resolve(process.cwd(), '../data.json');

  console.log(`Reading data from: ${dataFile}`);

  // Lire le fichier JSON
  const rawData = fs.readFileSync(dataFile, 'utf-8');
  const locations: LegacyLocation[] = JSON.parse(rawData);

  console.log(`Found ${locations.length} locations to migrate`);

  // Initialiser le schéma de la base de données
  await initializeDatabase();

  // Vérifier si des données existent déjà
  const existingCount = await pool.query('SELECT COUNT(*) FROM locations');
  const count = parseInt(existingCount.rows[0].count, 10);

  if (count > 0) {
    console.log(`Database already contains ${count} locations.`);
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('Do you want to delete existing data and reimport? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Migration cancelled.');
      process.exit(0);
    }

    // Supprimer les données existantes
    await pool.query('TRUNCATE locations RESTART IDENTITY');
    console.log('Existing data deleted.');
  }

  // Insérer les nouvelles données par lots de 100
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < locations.length; i += batchSize) {
    const batch = locations.slice(i, i + batchSize);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const loc of batch) {
        try {
          await client.query(
            `INSERT INTO locations (nom, adresse, code_postal, ville, type, niveau, telephone, contact, email, commentaire, lat, lon)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              loc.nom || '',
              loc.adresse || '',
              loc.codePostal || '',
              loc.ville || '',
              loc.type || '',
              loc.niveau || null,
              loc.telephone || null,
              loc.contact || null,
              loc.email || null,
              loc.commentaire || null,
              loc.lat ?? null,
              loc.lon ?? null,
            ]
          );
          inserted++;
        } catch (error) {
          console.error(`Error inserting location "${loc.nom}":`, error);
          errors++;
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Batch failed, rolling back:', error);
    } finally {
      client.release();
    }

    // Afficher la progression
    const progress = Math.min(i + batchSize, locations.length);
    console.log(`Progress: ${progress}/${locations.length} (${Math.round((progress / locations.length) * 100)}%)`);
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total locations in file: ${locations.length}`);
  console.log(`Successfully inserted: ${inserted}`);
  console.log(`Errors: ${errors}`);

  // Vérifier le résultat final
  const finalCount = await pool.query('SELECT COUNT(*) FROM locations');
  console.log(`Total in database: ${finalCount.rows[0].count}`);

  await pool.end();
  console.log('Migration completed!');
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
