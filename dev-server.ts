import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Get the paths to directories
const templatesDir = path.join(__dirname, 'htmlTemplates');
const assetsDir = path.join(__dirname, 'htmlAssets');

// Serve static files from htmlAssets directory
app.use('/assets', express.static(assetsDir));

// Add logging for static file requests
app.use('/assets', (req, res, next) => {
    console.log(`📁 Static file request: ${req.path}`);
    next();
});

// List all available templates
app.get('/', (req, res) => {
    try {
        const files = fs.readdirSync(templatesDir);
        const htmlFiles = files.filter(file => file.endsWith('.html'));
        
        // Get available assets
        const assetsFiles = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
        const imageFiles = assetsFiles.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));
        const audioFiles = assetsFiles.filter(file => /\.(mp3|wav|ogg|m4a)$/i.test(file));
        
        let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        h1 {
            color: white;
            text-align: center;
        }
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .template-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .template-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }
        .template-card h2 {
            margin-top: 0;
            color: #333;
        }
        .template-card p {
            color: #666;
            margin: 10px 0;
        }
        .template-card a {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
        }
        .template-card a:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <h1>🎨 HTML Template Preview</h1>
    <div class="templates-grid">
`;

        htmlFiles.forEach(file => {
            const templateName = file.replace('.html', '');
            const displayName = templateName
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            
            html += `
        <div class="template-card">
            <h2>${displayName}</h2>
            <p>Preview this template in your browser</p>
            <a href="/preview/${templateName}">Open Template →</a>
        </div>
            `;
        });

        html += `
    </div>
    
    <div style="margin-top: 40px; background: white; border-radius: 10px; padding: 20px;">
        <h2 style="color: #333; margin-top: 0;">📁 Available Files</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            <div>
                <h3 style="color: #667eea; margin: 0 0 10px 0;">🖼️ Images (${imageFiles.length})</h3>
                ${imageFiles.length > 0 ? imageFiles.map(file => 
                    `<div style="margin: 5px 0;"><a href="/assets/${file}" target="_blank">${file}</a></div>`
                ).join('') : '<div style="color: #666;">No image files found in htmlAssets/</div>'}
            </div>
            <div>
                <h3 style="color: #667eea; margin: 0 0 10px 0;">🎵 Audio (${audioFiles.length})</h3>
                ${audioFiles.length > 0 ? audioFiles.map(file => 
                    `<div style="margin: 5px 0;"><a href="/assets/${file}" target="_blank">${file}</a></div>`
                ).join('') : '<div style="color: #666;">No audio files found in htmlAssets/</div>'}
            </div>
        </div>
        <p style="color: #666; margin-top: 20px; font-size: 12px;">
            💡 To add your own files, place them in the <code>htmlAssets/</code> folder<br>
            Supported formats: images (jpg, png, svg, etc.), audio (mp3, wav, etc.)
        </p>
    </div>
</body>
</html>
        `;

        res.send(html);
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
        files.filter(file => file.endsWith('.html')).forEach(file => {
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

