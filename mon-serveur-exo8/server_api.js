const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const LOG_FILE = "server.log";

async function logRequest(message) {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    await fs.appendFile(LOG_FILE, logMessage);
}

// Lecture du fichier JSON
async function readArticles() {
    const data = await fs.readFile("articles.json", "utf8");
    return JSON.parse(data).articles;
}

// Écriture dans le fichier JSON
async function writeArticles(articles) {
    await fs.writeFile("articles.json", JSON.stringify({ articles }, null, 2));
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
    const logMessage = `${req.method} ${req.url}`;
    console.log(logMessage);
    await logRequest(logMessage);

    // Routes API
    if (req.url === "/articles" && req.method === "GET") {
        const articles = await readArticles();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ articles }));
    } else if (req.url === "/articles" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const article = JSON.parse(body);
                if (!article.title || !article.content) {
                    throw new Error("Missing title or content");
                }
                const articles = await readArticles();
                article.id = Date.now();
                articles.push(article);
                await writeArticles(articles);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify(article));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else if (req.url.match(/\/articles\/\d+$/) && req.method === "DELETE") {
        const id = parseInt(req.url.split("/").pop(), 10);
        const articles = await readArticles();
        const updatedArticles = articles.filter(article => article.id !== id);

        if (articles.length === updatedArticles.length) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Article not found" }));
            return;
        }

        await writeArticles(updatedArticles);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Article deleted" }));
    } else if (req.url.match(/\/articles\/\d+$/) && req.method === "PUT") {
        const id = parseInt(req.url.split("/").pop(), 10);
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
            try {
                const updatedArticle = JSON.parse(body);
                if (!updatedArticle.title || !updatedArticle.content) {
                    throw new Error("Missing title or content");
                }
                let articles = await readArticles();
                let articleIndex = articles.findIndex(article => article.id === id);

                if (articleIndex === -1) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Article not found" }));
                    return;
                }

                articles[articleIndex] = { id, ...updatedArticle };
                await writeArticles(articles);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(articles[articleIndex]));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: error.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not found" }));
    }
});

server.listen(3000, () => {
    console.log("http://localhost:3000");
});
