import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ACCESS_LOG = path.join(__dirname, '../logs/access.log');
const ERROR_LOG = path.join(__dirname, '../logs/error.log');

export async function logRequest(method, url) {
   
}

export async function logError(error) {
   
}
