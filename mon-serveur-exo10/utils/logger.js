import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Déterminer le répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Définition des chemins des fichiers de logs
const ACCESS_LOG = path.join(__dirname, "../logs/access.log");
const ERROR_LOG = path.join(__dirname, "../logs/error.log");

/**
 * Enregistre une requête HTTP avec la méthode et l'URL.
 * @param {string} method - Méthode HTTP (GET, POST, etc.).
 * @param {string} url - URL de la requête.
 */
export async function logRequest(method, url) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${method} ${url}\n`;

    console.log(logMessage.trim()); // Affiche dans la console

    try {
        await fs.appendFile(ACCESS_LOG, logMessage, "utf-8"); // Ajoute au fichier access.log
    } catch (error) {
        console.error("Erreur lors de l'écriture du log d'accès :", error);
    }
}

/**
 * Enregistre une erreur avec un message et une stack trace.
 * @param {Error} error - L'erreur capturée.
 */
export async function logError(error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ERROR: ${error.message}\nStack: ${error.stack}\n`;

    console.error(errorMessage.trim()); // Affiche dans la console en rouge

    try {
        await fs.appendFile(ERROR_LOG, errorMessage, "utf-8"); // Ajoute au fichier error.log
    } catch (fsError) {
        console.error("Erreur lors de l'écriture du log d'erreur :", fsError);
    }
}