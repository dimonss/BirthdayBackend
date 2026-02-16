import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PAGES_DIR, API_PORT } from './config.js';
import { checkUserFiles, readClientConfig } from './helpers.js';

export function startApiServer() {
    const app = express();

    // API: Get list of folders in pages directory
    app.get('/pages', (req, res) => {
        try {
            if (!fs.existsSync(PAGES_DIR!)) {
                return res.json({ folders: [] });
            }

            const entries = fs.readdirSync(PAGES_DIR!, { withFileTypes: true });
            const folders = entries
                .filter(entry => {
                    if (!entry.isDirectory()) return false;
                    const userDir = path.join(PAGES_DIR!, entry.name);
                    if (!checkUserFiles(userDir)) return false;
                    const config = readClientConfig(userDir);
                    return config.showOnMainPage;
                })
                .map(entry => {
                    const stats = fs.statSync(path.join(PAGES_DIR!, entry.name));
                    return { name: entry.name, mtime: stats.mtime.getTime() };
                })
                .sort((a, b) => b.mtime - a.mtime)
                .map(entry => entry.name);

            res.json({ folders });
        } catch (error) {
            console.error('Error reading pages directory:', error);
            res.status(500).json({ error: 'Failed to read pages directory' });
        }
    });

    app.listen(API_PORT, () => {
        console.log(`🌐 API server running on port ${API_PORT}`);
    });
}
