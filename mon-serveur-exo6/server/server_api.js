const http = require("http");
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = process.argv[2] || 4001;
const filePath = path.join(__dirname, "../data/database.json");

const server = http.createServer((req, res) => {
    // Gérer les requêtes OPTIONS (pré-vérification CORS)
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*", // Autoriser seulement ton frontend
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
    }

    // Ajouter les en-têtes CORS pour toutes les autres requêtes
    res.setHeader("Access-Control-Allow-Origin", "*"); // Remplace par '*' pour autoriser tout le monde
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "GET" && req.url === "/data") {
        // Lire le fichier JSON
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end(
                    JSON.stringify({
                        error: "Erreur lors de la lecture du fichier JSON",
                    }),
                );
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(data || "[]");
            }
        });
    } else if (req.method === "POST" && req.url === "/submit") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            try {
                const newEpisode = JSON.parse(body);

                // Vérifier si les champs sont valides
                if (
                    !newEpisode.episode ||
                    !newEpisode.title ||
                    !newEpisode.image ||
                    !Array.isArray(newEpisode.scenes)
                ) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    return res.end(
                        JSON.stringify({
                            error: "Format invalide. Un épisode doit contenir 'episode', 'title', 'image' et 'scenes'.",
                        }),
                    );
                }

                fs.readFile(filePath, "utf8", (err, data) => {
                    let episodes = [];

                    if (!err && data) {
                        episodes = JSON.parse(data);
                    }

                    // Vérifier si l'épisode existe déjà
                    if (
                        episodes.some((ep) => ep.episode === newEpisode.episode)
                    ) {
                        res.writeHead(400, {
                            "Content-Type": "application/json",
                        });
                        return res.end(
                            JSON.stringify({
                                error: "L'épisode avec ce numéro existe déjà.",
                            }),
                        );
                    }

                    // Ajouter le nouvel épisode
                    episodes.push(newEpisode);

                    fs.writeFile(
                        filePath,
                        JSON.stringify(episodes, null, 2),
                        (err) => {
                            if (err) {
                                res.writeHead(500, {
                                    "Content-Type": "application/json",
                                });
                                return res.end(
                                    JSON.stringify({
                                        error: "Erreur lors de l'écriture du fichier JSON",
                                    }),
                                );
                            }

                            res.writeHead(201, {
                                "Content-Type": "application/json",
                            });
                            res.end(
                                JSON.stringify({
                                    message: "Épisode ajouté avec succès",
                                    newEpisode,
                                }),
                            );
                        },
                    );
                });
            } catch (error) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON format" }));
            }
        });
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});
server.listen(port, hostname, () => {
    console.log(`Serveur en fonctionnement à http://${hostname}:${port}/`);
});

