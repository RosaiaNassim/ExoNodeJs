import { logError } from "../utils/logger.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function getDBConnection() {
    return open({
        filename: "./database.db",
        driver: sqlite3.Database,
    });
}

export async function handleRequest(req, res) {
    if (req.url === '/articles' && req.method === 'GET') {
        await getAllArticles(req, res);
    } else if (req.url === '/articles' && req.method === 'POST') {
        await createArticle(req, res);
    } else if (req.url.match(/^\/articles\/\d+$/) && req.method === 'GET') {
        const id = parseInt(req.url.split('/').pop(), 10);
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid article ID' }));
            return;
        }
        await getArticleById(req, res, id);
    } else if (req.url.match(/^\/articles\/\d+$/) && req.method === 'PUT') {
        const id = parseInt(req.url.split('/').pop(), 10);
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid article ID' }));
            return;
        }
        await updateArticle(req, res, id);
    } else if (req.url.match(/^\/articles\/\d+$/) && req.method === 'DELETE') {
        const id = parseInt(req.url.split('/').pop(), 10);
        if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid article ID' }));
            return;
        }
        await deleteArticle(req, res, id);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
}

async function getAllArticles(req, res) {
    try {
        const db = await getDBConnection();
        const articles = await db.all("SELECT * FROM articles");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(articles));
    } catch (error) {
        await logError(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

async function getArticleById(req, res, id) {
    try {
        const db = await getDBConnection();
        const articles = await db.all("SELECT * FROM articles");
        const article = articles.find((article) => article.id === id);
        if (!article) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Article not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(article));
        }
    } catch (error) {
        await logError(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

async function createArticle(req, res) {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
        try {
            const article = JSON.parse(body);
            if (!article.title || !article.content) {
                throw new Error('Missing title or content');
            }
            
            const db = await getDBConnection();
            const result = await db.run("INSERT INTO articles (title, content) VALUES (?, ?)", [article.title, article.content]);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: result.lastID, ...article }));
        } catch (error) {
            await logError(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON or missing fields' }));
        }
    });
}

async function updateArticle(req, res, id) {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
        try {
            const updatedArticle = JSON.parse(body);
            if (!updatedArticle.title || !updatedArticle.content) {
                throw new Error('Missing title or content');
            }
            
            const db = await getDBConnection();
            await db.run("UPDATE articles SET title = ?, content = ? WHERE id = ?", [updatedArticle.title, updatedArticle.content, id]);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id, ...updatedArticle }));
        } catch (error) {
            await logError(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON or missing fields' }));
        }
    });
}

async function deleteArticle(req, res, id) {
    try {
        const db = await getDBConnection();
        const result = await db.run("DELETE FROM articles WHERE id = ?", [id]);
        
        if (result.changes === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Article not found' }));
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Article deleted' }));
    } catch (error) {
        await logError(error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
    }
}

export {
getAllArticles,
getArticleById,
createArticle,
updateArticle,
deleteArticle
}
nassim