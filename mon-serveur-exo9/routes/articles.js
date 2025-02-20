import { readJsonFile, writeJsonFile } from '../utils/file-utils.js';
import { logError } from '../utils/logger.js';

const ARTICLES_FILE = './data/articles.json';

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
        const articles = await readJsonFile(ARTICLES_FILE);
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
        const articles = await readJsonFile(ARTICLES_FILE);
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

            const articles = await readJsonFile(ARTICLES_FILE);
            article.id = Date.now();
            articles.push(article);

            await writeJsonFile(ARTICLES_FILE, articles);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(article));
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

            let articles = await readJsonFile(ARTICLES_FILE);
            let articleIndex = articles.findIndex((article) => article.id === id);
            if (articleIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Article not found' }));
                return;
            }

            articles[articleIndex] = { id, ...updatedArticle };
            await writeJsonFile(ARTICLES_FILE, articles);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(articles[articleIndex]));
        } catch (error) {
            await logError(error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON or missing fields' }));
        }
    });
}

async function deleteArticle(req, res, id) {
    try {
        const articles = await readJsonFile(ARTICLES_FILE);
        const updatedArticles = articles.filter((article) => article.id !== id);

        if (articles.length === updatedArticles.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Article not found' }));
            return;
        }

        await writeJsonFile(ARTICLES_FILE, updatedArticles);
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
};
