import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const runSql = async (label, filePath) => {
  try {
    const sql = readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(` ${label} executed successfully`);
  } catch (err) {
    console.error(` Error in ${label}:`, err.message);
    throw err;
  }
};

const initDb = async () => {
  console.log('\n Initializing Qelem Meda Technologies — Inventory & Sales DB...\n');
  try {
  
    await runSql('Schema', join(__dirname, '../database/schema.sql'));

    await runSql('Seed Data', join(__dirname, '../database/seed.sql'));

    console.log('\n Database initialized successfully!\n');
  } catch (err) {
    console.error('\n Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

initDb();
