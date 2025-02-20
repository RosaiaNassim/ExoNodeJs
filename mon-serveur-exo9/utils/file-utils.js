import { promises as fs } from 'fs';

export async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data).articles;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
}

export async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify({ articles: data }, null, 2));
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
    }
}
