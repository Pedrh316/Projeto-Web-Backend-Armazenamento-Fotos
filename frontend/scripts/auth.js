const API = 'http://localhost:8000';

async function requisicaoAuth(path, metodo = 'GET', dados) {
  const opcoes = {
    method: metodo,
    credentials: 'include', // Envia/recebe o cookie de sessão
    headers: {}
  };

  if (dados !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API + path, opcoes);
  const texto = await resposta.text();
  let resultado = null;
  try { resultado = texto ? JSON.parse(texto) : null; }
  catch { resultado = { erro: texto || 'Resposta inválida do servidor.' }; }

  if (!resposta.ok) throw new Error(resultado?.erro || resultado?.message || `Erro HTTP ${resposta.status}`);
  return resultado;
}

function mostrarMensagem(texto, erro = false) {
  const elemento = document.getElementById('mensagem');
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = erro ? 'message error' : 'message success';
}

function mostrarResultado(dados) {
  const elemento = document.getElementById('resultado');
  if (!elemento) return;
  elemento.hidden = false;
  elemento.textContent = JSON.stringify(dados, null, 2);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(loginForm));
  try {
    const resultado = await requisicaoAuth('/auth/login', 'POST', dados);
    mostrarMensagem('Login realizado com sucesso!');
    mostrarResultado(resultado);
    window.location.href = 'index.html';
  } catch (erro) { mostrarMensagem(erro.message, true); }
});

const registrarForm = document.getElementById('registrarForm');
if (registrarForm) registrarForm.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(registrarForm));
  try {
    const resultado = await requisicaoAuth('/auth/registrar', 'POST', dados);
    mostrarMensagem('Conta registrada com sucesso! Agora você pode entrar.');
    mostrarResultado(resultado);
  } catch (erro) { mostrarMensagem(erro.message, true); }
});

const meButton = document.getElementById('meButton');
if (meButton) meButton.addEventListener('click', async () => {
  try {
    const resultado = await requisicaoAuth('/auth/me');
    mostrarMensagem('Sessão válida.');
    mostrarResultado(resultado);
  } catch (erro) { mostrarMensagem(erro.message, true); mostrarResultado({ erro: erro.message }); }
});

const logoutButton = document.getElementById('logoutButton');
if (logoutButton) logoutButton.addEventListener('click', async () => {
  try {
    const resultado = await requisicaoAuth('/auth/logout', 'POST', {});
    mostrarMensagem(resultado?.mensagem || 'Logout realizado.');
    mostrarResultado(resultado);
  } catch (erro) { mostrarMensagem(erro.message, true); }
});
