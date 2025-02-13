const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "../public");

function serveStaticFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end("<h1>Page non trouvée</h1>");
        } else {
            const ext = path.extname(filePath);
            const mimeTypes = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "application/javascript",
            };
            res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
            res.end(data);
        }
    });
}

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);
    serveStaticFile(res, filePath);
});

server.listen(PORT, () => {
    console.log(`Server HTML running at http://localhost:${PORT}/`);
});
