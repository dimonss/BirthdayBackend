import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '..', 'data', 'users.db');

// Initialize database
export async function initializeDatabase() {
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

    return db;
}

// Register or update user
export async function registerUser(user: {
    telegram_id: number;
    username: string;
    first_name?: string;
    last_name?: string;
}) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.run(`
        INSERT INTO users (telegram_id, username, first_name, last_name, last_activity)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(telegram_id) DO
        UPDATE SET
            username = excluded.username,

            first_name = excluded.first_name,
            last_name = excluded.last_name,
            last_activity = CURRENT_TIMESTAMP
    `, [user.telegram_id, user.username, user.first_name, user.last_name]);

    await db.close();
}

// Update user's file status
export async function updateUserFileStatus(telegram_id: number, hasPhoto: boolean, hasAudio: boolean) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.run(`
        UPDATE users
        SET has_photo = ?, has_audio = ?, last_activity = CURRENT_TIMESTAMP
        WHERE telegram_id = ?
    `, [hasPhoto ? 1 : 0, hasAudio ? 1 : 0, telegram_id]);

    await db.close();
}

// Get user status
export async function getUserStatus(telegram_id: number) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const user = await db.get(`
        SELECT has_photo, has_audio, registered_at, last_activity
        FROM users
        WHERE telegram_id = ?
    `, [telegram_id]);

    await db.close();
    return user;
}

// Delete user
export async function deleteUser(telegram_id: number) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.run(`
        DELETE FROM users
        WHERE telegram_id = ?
    `, [telegram_id]);

    await db.close();
} 