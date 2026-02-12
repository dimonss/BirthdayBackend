import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Get the paths to directories
const templatesDir = path.join(__dirname, 'htmlTemplates');
const assetsDir = path.join(__dirname, 'htmlAssets');
const devServerDir = path.join(__dirname, 'dev-server');
const pagesDir = process.env.PAGES_DIR || path.join(__dirname, 'pages');

// Serve static files from htmlAssets directory
app.use('/assets', express.static(assetsDir));

// Add logging for static file requests
app.use('/assets', (req, res, next) => {
    console.log(`📁 Static file request: ${req.path}`);
    next();
});

// API: Get list of folders in pages directory
app.get('/pages', (req, res) => {
    try {
        if (!fs.existsSync(pagesDir)) {
            return res.json({ folders: [] });
        }

        const entries = fs.readdirSync(pagesDir, { withFileTypes: true });
        const folders = entries
            .filter(entry => {
                if (!entry.isDirectory()) return false;
                const userDir = path.join(pagesDir, entry.name);
                return  fs.existsSync(path.join(userDir, 'img.jpg'));
            })
            .map(entry => {
                const stats = fs.statSync(path.join(pagesDir, entry.name));
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

// List all available templates
app.get('/', (req, res) => {
    try {
        const files = fs.readdirSync(templatesDir);
        const htmlFiles = files.filter(file => file.endsWith('.html') && file !== 'index.html');

        // Get available assets
        const assetsFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
        const imageFiles = assetsFiles.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));
        const audioFiles = assetsFiles.filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file));

        // Generate templates list
        const templatesList = htmlFiles.map(file => {
            const templateName = file.replace('.html', '');
            const displayName = templateName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());

            return `
        <div class="template-card">
            <h2>${displayName}</h2>
            <p>Preview this template in your browser</p>
            <a href="/preview/${templateName}">Open Template →</a>
        </div>
            `;
        }).join('');

        // Generate image files list
        const imageFilesList = imageFiles.length > 0
            ? imageFiles.map(file => `<div style="margin: 5px 0;"><a href="/assets/${file}" target="_blank">${file}</a></div>`).join('')
            : '<div style="color: #666;">No image files found in htmlAssets/</div>';

        // Generate audio files list
        const audioFilesList = audioFiles.length > 0
            ? audioFiles.map(file => `<div style="margin: 5px 0;"><a href="/assets/${file}" target="_blank">${file}</a></div>`).join('')
            : '<div style="color: #666;">No audio files found in htmlAssets/</div>';

        // Load and render the template
        const indexPath = path.join(devServerDir, 'index.html');
        let indexTemplate = fs.readFileSync(indexPath, 'utf8');

        // Replace placeholders
        indexTemplate = indexTemplate.replace('{{{TEMPLATES_LIST}}}', templatesList);
        indexTemplate = indexTemplate.replace('{{IMAGE_COUNT}}', imageFiles.length.toString());
        indexTemplate = indexTemplate.replace('{{AUDIO_COUNT}}', audioFiles.length.toString());
        indexTemplate = indexTemplate.replace('{{{IMAGE_FILES}}}', imageFilesList);
        indexTemplate = indexTemplate.replace('{{{AUDIO_FILES}}}', audioFilesList);

        res.send(indexTemplate);
    } catch (error) {
        console.error('Error reading templates directory:', error);
        res.status(500).send('Error loading templates');
    }
});

// Serve individual templates
app.get('/preview/:templateName', (req, res) => {
    const templateName = req.params.templateName;
    const templatePath = path.join(templatesDir, `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        return res.status(404).send('Template not found');
    }

    // Read the template
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Replace asset paths to point to /assets
    // This ensures images and audio files from the htmlAssets folder are accessible
    templateContent = templateContent.replace(/src="\.\/img\.jpg/g, 'src="/assets/img.jpg');
    templateContent = templateContent.replace(/src="\.\/img\./g, 'src="/assets/img.');
    templateContent = templateContent.replace(/src="\.\/audio\.mp3/g, 'src="/assets/audio.mp3');
    templateContent = templateContent.replace(/src="\.\/audio\./g, 'src="/assets/audio.');
    templateContent = templateContent.replace(/content="\.\/img\.jpg/g, 'content="/assets/img.jpg');
    templateContent = templateContent.replace(/content="\.\/img\./g, 'content="/assets/img.');

    res.send(templateContent);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Dev server running at http://localhost:${PORT}`);
    console.log(`📁 Templates: ${templatesDir}`);
    console.log(`📁 Assets: ${assetsDir}`);
    console.log(`\n✨ Available templates:`);

    try {
        const files = fs.readdirSync(templatesDir);
        files.filter(file => file.endsWith('.html') && file !== 'index.html').forEach(file => {
            const templateName = file.replace('.html', '');
            console.log(`   → http://localhost:${PORT}/preview/${templateName}`);
        });

        // Show assets
        if (fs.existsSync(assetsDir)) {
            const assetsFiles = fs.readdirSync(assetsDir);
            if (assetsFiles.length > 0) {
                console.log(`\n📦 Available assets: ${assetsFiles.join(', ')}`);
            }
        }
    } catch (error) {
        console.error('Error reading templates:', error);
    }
});

// Handle server errors gracefully
server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Try one of these solutions:`);
        console.error(`   1. Kill the existing process: lsof -ti:${PORT} | xargs kill -9`);
        console.error(`   2. Use a different port by setting PORT environment variable`);
        console.error(`   3. Wait for the existing server to stop`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

