const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = 3000;

// Fonction pour déterminer le type MIME en fonction de l'extension du fichier
function getMimeType(filePath) {
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Fonction pour compresser les fichiers avec Gzip
function compressWithGzip(filePath, res) {
    const gzip = zlib.createGzip(); // Créer un flux de compression gzip
    const source = fs.createReadStream(filePath); // Lire le fichier
    res.writeHead(200, { 
        'Content-Encoding': 'gzip', 
        'Content-Type': getMimeType(filePath) 
    }); // Définir les en-têtes HTTP pour indiquer la compression gzip
    source.pipe(gzip).pipe(res); // Passer le flux de données à travers Gzip, puis le renvoyer au client
}

// Fonction pour servir des fichiers statiques
function serveStaticFile(req, res, filePath) {
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Page non trouvée</h1>");
            return;
        }

        // Vérifie si le client accepte le gzip
        const acceptEncoding = req.headers['accept-encoding'] || '';
        if (acceptEncoding.includes('gzip')) {
            compressWithGzip(filePath, res); // Si le client accepte le gzip, compresser le fichier
        } else {
            fs.createReadStream(filePath).pipe(res); // Sinon, envoyer le fichier tel quel
        }
    });
}

// Création du serveur
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
    serveStaticFile(req, res, filePath);
});

// Lancer le serveur
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
