const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const port = process.argv[2] || 4000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript'
};

const server = http.createServer(async (req, res) => {
    try {
// Gérer la racine
        let filePath = './public' + (req.url === '/' ? '/index.html' : req.url);

// Déterminer le type MIME
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'text/plain';

// Lire et envoyer le fichier
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
// Gérer les erreurs (fichier non trouvé, etc.)
        res.writeHead(404);
        res.end('File not found');
    }
});

server.listen(3000, () => {
    console.log('http://localhost:4000');
});