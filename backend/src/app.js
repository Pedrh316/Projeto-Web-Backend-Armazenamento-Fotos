
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const { connectDatabase } = require('./config/database');

const server = http.createServer(async (req, res) => {
    try{
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN );
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
      }

      const url = new URL(req.url, 'http://localhost:8000');
      
      const path = url.pathname.replace(/^\/api(?=\/)/, '');
      req.url = path + url.search;
      req.query = Object.fromEntries(url.searchParams);
      let body = '';
      for await (const chunk of req) body += chunk;
      req.body = body ? JSON.parse(body) : {};
      if (/^\/usuarios\/[^/]+\/fotos(?:\/|$)/.test(path)) return require('./routes/fotos')(req, res);
      if (/^\/usuarios\/[^/]+\/albuns(?:\/|$)/.test(path)) return require('./routes/albuns')(req, res);
      if (path.startsWith('/usuarios')) return require('./routes/usuarios')(req, res);
      if (path.startsWith('/auth')) return require('./routes/auth.js')(req,res)
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
    } catch (e) {
        const msg = `[${new Date().toISOString()}] ${e.message || e}\n`;
        fs.appendFileSync(path.join(__dirname, '..', 'error.log'), msg, 'utf8');
          res.writeHead(500);
        res.end(JSON.stringify({ erro: 'Erro interno no servidor.' }));
    }
  });

  connectDatabase()
  .then(() => server.listen(process.env.NODE_PORT || 8000, () => console.log('Servidor iniciado!')))
    .catch(err => console.error(err));


