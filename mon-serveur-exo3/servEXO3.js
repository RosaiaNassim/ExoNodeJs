const http = require("http");
const fs = require("fs");

const PORT = 3000;
const DATA_FILE = "data.json";

// Fonction pour lire le fichier JSON
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// Fonction pour écrire dans le fichier JSON
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Création du serveur
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/users") {
    // Retourne tous les utilisateurs
    res.end(JSON.stringify(readData()));
  } 
  
  else if (req.method === "GET" && req.url.startsWith("/user/")) {
    // Retourne un utilisateur par ID
    const id = parseInt(req.url.split("/")[2]);
    const users = readData();
    const user = users.find((u) => u.id === id);

    if (user) {
      res.end(JSON.stringify(user));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: "Utilisateur non trouvé" }));
    }
  } 
  
  else if (req.method === "POST" && req.url === "/user") {
    // Ajoute un utilisateur
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const newUser = JSON.parse(body);
      const users = readData();
      newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
      users.push(newUser);
      writeData(users);

      res.writeHead(201);
      res.end(JSON.stringify(newUser));
    });
  } 
  
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route non trouvée" }));
  }
});

// Lancer le serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
