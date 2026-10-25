
const Auth = require('../services/authService');
const autenticar = require('../middlewares/authentication');
const { definirCookie,limparCookie} = require('../utils/cookies');

function responder(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(dados));
}

module.exports = async function authRoutes(req, res) {
    try {
        if (req.method === 'POST' && req.url === '/auth/registrar') {
            const usuario = await Auth.registrar(req.body);
            return responder(res, 201, { usuario });
        }
        if (req.method === 'POST' && req.url === '/auth/login') {
            const resultado = await Auth.login(req.body);
            definirCookie(res, resultado.token);
            return responder(res, 200, { usuario: resultado.usuario });
        }
        if (req.method === 'POST' && req.url === '/auth/logout') {
            limparCookie(res);
            return responder(res, 200, { mensagem: 'Sessão terminada.' });
        }
        if (req.method === 'GET' && req.url === '/auth/me') {
            if (!autenticar(req, res)) return responder(res, 401, { erro: 'Não autenticado.' });
            const usuario = await Auth.obterUsuario(req.user.sub);
            if (usuario) return responder(res, 200, { usuario });
            limparCookie(res);
            return responder(res, 401, { erro: 'Usuário não encontrado.' });
        }
        return responder(res, 404, {erro: 'Rota de autenticação não encontrada.'});
    } catch (error) {
        const status = error.status || 500;
        console.error(error)
        return responder(res,status, { erro: status === 500 ? 'Erro interno do servidor.' : error.message});
    }
};
