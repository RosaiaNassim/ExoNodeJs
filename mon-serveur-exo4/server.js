const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// Fonction pour lire un fichier HTML et l'afficher
function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Page non trouvée</h1>");
        } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        }
    });
}

// Création du serveur
const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url + ".html");

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Page non trouvée</h1>");
        } else {
            serveFile(res, filePath);
        }
    });
});

// Lancer le serveur
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
