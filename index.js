const http = require("http");
const fs = require("fs"); 
const path = require("path"); 

const hostname = "127.0.0.1";
const port = process.env.PORT || 4000;


const userMessage = process.argv[2] || "Aucun message fourni";
console.log(`Message reçu : ${userMessage}`);

const textFilePath = path.join(__dirname, "txt.txt");
fs.readFile(textFilePath, "utf8", (err, data) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier texte", err);
    } else {
        console.log("Contenu du fichier texte :\n", data);
    }
});

const server = http.createServer((req, res) => {
   
    if (req.method === "GET" && req.url === "/data") {
     
        fs.readFile(path.join(__dirname, "apidbl.json"), (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("Erreur lors de la lecture du fichier JSON");
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(data); 
            }
        });
    } else {
        res.statusCode = 404;
        res.end("Not Found");
    }
});

server.listen(port, hostname, () => {
    console.log(`Serveur en fonctionnement à http://${hostname}:${port}/`);
});