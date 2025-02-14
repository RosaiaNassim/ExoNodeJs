const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const hostname = "127.0.0.1";
const port = 3007;

const server = http.createServer((req, res) => {
    let filePath;

    // Vérifier quelle ressource est demandée par l'URL
    if (req.url === "/") {
        filePath = path.join(__dirname, "../public/index.html");
    } else if (req.url === "/admin") {
        filePath = path.join(__dirname, "../public/admin.html");
    } else if (req.url === "/style.css") {
        filePath = path.join(__dirname, "../public/style.css");
    } else if (req.url === "/script.js") {
        filePath = path.join(__dirname, "../public/script.js");
    } else if (req.url.startsWith("/assets/logo.png")) {
        filePath = path.join(__dirname, req.url);
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Page non trouvée");
    }

    // Lire le fichier et envoyer la réponse
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            return res.end("Erreur lors de la lecture du fichier");
        }
        //compression
        const compressible =
            filePath.endsWith(".html") ||
            filePath.endsWith(".css") ||
            filePath.endsWith(".js");
        if (compressible) {
            res.writeHead(200, { "Content-Encoding": "gzip" }); // Indiquer au client qu'il reçoit du Gzip
            const compressedData = zlib.gzipSync(data); // Compresser le fichier
            res.end(compressedData);
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
});

server.listen(port, hostname, () => {
    console.log(`✅ Serveur en fonctionnement à http://${hostname}:${port}/`);
});
