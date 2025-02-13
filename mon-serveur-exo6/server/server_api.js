const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const DATA_FILE = path.join(__dirname, "../data/database.json");

function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/api/data") {
        const data = readData();
        res.end(JSON.stringify(data));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(PORT, () => {
    console.log(`Server API running at http://localhost:${PORT}`);
});