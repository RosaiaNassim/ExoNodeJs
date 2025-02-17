const http = require("http");
const fs = require("fs").promises;

const port = process.argv[2] || 3000;

// Lecture du fichier JSON
async function readArticles() {
    const data = await fs.readFile("articles.json", "utf8");
    return JSON.parse(data);
}

// Écriture dans le fichier JSON
async function writeArticles(articles) {
    await fs.writeFile("articles.json", JSON.stringify(articles, null, 2));
}

const server = http.createServer(async (req, res) => {
    // Headers CORS
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Gestion du preflight CORS
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Logging des requêtes
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Routes API
    if (req.url === "/articles" && req.method === "GET") {
        const articles = await readArticles();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(articles));
    } else if (req.url === "/articles" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const article = JSON.parse(body);
                const articles = await readArticles();
                article.id = Date.now(); // Simple ID unique
                articles.push(article);
                await writeArticles(articles);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(article));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: "Invalid data" }));
            }
        });
    } else if (req.url.match(/\/articles\/\d+$/) && req.method === "DELETE") {
      //Code
    } else if (req.url.match(/\/articles\/\d+$/) && req.method === "PUT") {
      //Code
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(4000, () => {
    console.log("http://localhost:3000");
});

