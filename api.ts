import express from 'express';
import * as fs from 'fs';
import { PAGES_DIR, API_PORT } from './config.js';

export function startApiServer() {
    const app = express();

    // API: Get list of folders in pages directory
    app.get('/api/pages', (req, res) => {
        try {
            if (!fs.existsSync(PAGES_DIR!)) {
                return res.json({ folders: [] });
            }

            const entries = fs.readdirSync(PAGES_DIR!, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory())
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
