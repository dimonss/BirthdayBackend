import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, 'data', 'users.db');

// Initialize database
export async function initializeDatabase() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Created data directory');
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Create users table if it doesn't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
            has_photo BOOLEAN DEFAULT 0,
            has_audio BOOLEAN DEFAULT 0
        )
    `);

    console.log('Database initialized successfully');
    
    // Test database connection
    const result = await db.get('SELECT 1 as test');
    if (result?.test === 1) {
        console.log('Database connection test successful');
    }

    return db;
}

// Run initialization if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase()
        .then(async (db) => {
            await db.close();
            console.log('Database initialization completed');
        })
        .catch((error) => {
            console.error('Error initializing database:', error);
            process.exit(1);
        });
} 