const API = 'http://localhost:8000';
const mensagem = document.getElementById('mensagem');
let usuarioAtual;

async function requisicao(path, metodo = 'GET', dados) {
  const opcoes = { method: metodo, credentials: 'include', headers: {} };
  if (dados !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(API + path, opcoes);
  const texto = await resposta.text();
  let resultado = null;
  try { resultado = texto ? JSON.parse(texto) : null; }
  catch { resultado = { erro: texto || 'Resposta inválida do servidor.' }; }

  if (!resposta.ok) {
    throw new Error(resultado?.erro || resultado?.message || `Erro HTTP ${resposta.status}.`);
  }
  return resultado;
}

function avisar(texto, erro = false) {
  if (!mensagem) return;
  mensagem.textContent = texto;
  mensagem.classList.toggle('error', erro);
}

async function executar(acao, sucesso = 'Operação concluída com sucesso.') {
  try {
    await acao();
    avisar(sucesso);
  } catch (erro) {
    avisar(erro.message, true);
  }
}

function elemento(tag, classe, texto) {
  const node = document.createElement(tag);
  if (classe) node.className = classe;
  if (texto !== undefined) node.textContent = texto;
  return node;
}

function acaoBotao(texto, classe, acao, id) {
  const botao = elemento('button', `button button-quiet ${classe || ''}`, texto);
  botao.type = 'button';
  botao.dataset.action = acao;
  botao.dataset.id = id;
  return botao;
}

function renderizarUsuarios(usuarios) {
  const lista = document.getElementById('usuarios');
  lista.replaceChildren();
  if (!usuarios.length) {
    lista.append(elemento('li', 'empty-state', 'Nenhum usuário cadastrado.'));
    return;
  }

  usuarios.forEach(usuario => {
    const linha = elemento('li', 'record-row');
    const info = elemento('div', 'record-main');
    info.append(elemento('strong', '', usuario.nome), elemento('small', '', usuario.email));
    const acoes = elemento('div', 'record-actions');
    acoes.append(acaoBotao('Editar', '', 'edit', usuario._id));
    acoes.append(acaoBotao('Excluir', 'delete-button', 'delete', usuario._id));
    linha.append(info, acoes);
    lista.append(linha);
  });
}

async function carregarUsuarios() {
  renderizarUsuarios(await requisicao('/usuarios'));
}

function iniciarUsuarios() {
  const formNovo = document.getElementById('formUsuario');
  const formEditar = document.getElementById('editarUsuario');
  const lista = document.getElementById('usuarios');

  formNovo.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      await requisicao('/usuarios', 'POST', Object.fromEntries(new FormData(formNovo)));
      formNovo.reset();
      await carregarUsuarios();
    });
  });

  formEditar.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      const dados = Object.fromEntries(new FormData(formEditar));
      const id = dados.id;
      delete dados.id;
      await requisicao(`/usuarios/${encodeURIComponent(id)}`, 'PUT', dados);
      formEditar.reset();
      formEditar.hidden = true;
      await carregarUsuarios();
    });
  });

  lista.addEventListener('click', evento => {
    const botao = evento.target.closest('button[data-action]');
    if (!botao) return;
    const id = botao.dataset.id;
    if (botao.dataset.action === 'delete' && !window.confirm('Excluir este usuário? Esta ação não pode ser desfeita.')) return;
    executar(async () => {
      if (botao.dataset.action === 'edit') {
        const usuario = await requisicao(`/usuarios/${encodeURIComponent(id)}`);
        formEditar.elements.id.value = usuario._id;
        formEditar.elements.nome.value = usuario.nome;
        formEditar.elements.email.value = usuario.email;
        formEditar.hidden = false;
        formEditar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        avisar('Edite os dados e salve para concluir.');
        return;
      }
      await requisicao(`/usuarios/${encodeURIComponent(id)}`, 'DELETE');
      await carregarUsuarios();
    }, botao.dataset.action === 'edit' ? 'Dados carregados para edição.' : 'Usuário excluído com sucesso.');
  });

  document.querySelector('[data-cancel-edit]').addEventListener('click', () => {
    formEditar.reset();
    formEditar.hidden = true;
  });
  document.querySelector('[data-refresh]').addEventListener('click', () => executar(carregarUsuarios));
  executar(carregarUsuarios);
}

function resetarFormulario(form, modoEdicao = false) {
  form.reset();
  form.elements.id.value = '';
  form.querySelector('[data-form-heading]').textContent = modoEdicao ? 'Editar registro' : form.id === 'albumForm' ? 'Novo álbum' : 'Nova foto';
  form.querySelector('[data-submit-label]').innerHTML = modoEdicao
    ? 'Salvar alterações'
    : form.id === 'albumForm' ? 'Criar álbum <span aria-hidden="true">&#8594;</span>' : 'Adicionar foto <span aria-hidden="true">&#8594;</span>';
  form.querySelector('[data-cancel-edit]').hidden = !modoEdicao;
}

function renderizarAlbuns(albuns) {
  const lista = document.getElementById('albuns');
  lista.replaceChildren();
  if (!albuns.length) {
    lista.append(elemento('li', 'empty-state', 'Ainda não há álbuns nesta biblioteca.'));
    return;
  }
  albuns.forEach(album => {
    const linha = elemento('li', 'record-row');
    const info = elemento('div', 'record-main');
    info.append(elemento('strong', '', album.nome), elemento('small', '', album.descricao || 'Sem descrição'));
    const acoes = elemento('div', 'record-actions');
    acoes.append(acaoBotao('Visualizar', '', 'view', album._id));
    acoes.append(acaoBotao('Editar', '', 'edit', album._id));
    acoes.append(acaoBotao('Excluir', 'delete-button', 'delete', album._id));
    linha.append(info, acoes);
    lista.append(linha);
  });
}

async function carregarAlbuns() {
  const id = encodeURIComponent(usuarioAtual.id);
  const [albuns, fotos] = await Promise.all([
    requisicao(`/usuarios/${id}/albuns`),
    requisicao(`/usuarios/${id}/fotos`)
  ]);
  renderizarAlbuns(albuns);
  preencherAlbunsAssociacao(albuns);
  preencherFotosAdicionar(fotos);
  await atualizarFotosRemover();
}

function preencherOpcoes(select, itens, textoVazio, textoItem) {
  select.replaceChildren();
  const opcaoInicial = document.createElement('option');
  opcaoInicial.value = '';
  opcaoInicial.textContent = textoVazio;
  select.append(opcaoInicial);
  itens.forEach(item => {
    const opcao = document.createElement('option');
    opcao.value = item._id;
    opcao.textContent = textoItem(item);
    select.append(opcao);
  });
}

function preencherAlbunsAssociacao(albuns) {
  document.querySelectorAll('#adicionarFotoAlbum select[name="albumId"], #removerFotoAlbum select[name="albumId"]')
    .forEach(select => preencherOpcoes(select, albuns, 'Selecione um álbum', album => album.nome));
}

async function preencherFotosAdicionar(fotos) {
  preencherOpcoes(
    document.querySelector('#adicionarFotoAlbum select[name="fotoId"]'),
    fotos,
    'Selecione uma foto',
    foto => foto.titulo
  );
}

function idComoTexto(id) {
  if (typeof id === 'string') return id;
  return id?.$oid || id?.toHexString?.() || String(id);
}

async function atualizarFotosRemover() {
  const form = document.getElementById('removerFotoAlbum');
  const albumId = form.elements.albumId.value;
  const selectFoto = form.elements.fotoId;
  if (!albumId) {
    preencherOpcoes(selectFoto, [], 'Selecione um álbum primeiro', foto => foto.titulo);
    return;
  }

  const album = await requisicao(`/usuarios/${encodeURIComponent(usuarioAtual.id)}/albuns/${encodeURIComponent(albumId)}`);
  const fotosIds = new Set((album.fotos || []).map(idComoTexto));
  const fotos = await requisicao(`/usuarios/${encodeURIComponent(usuarioAtual.id)}/fotos`);
  const fotosNoAlbum = fotos.filter(foto => fotosIds.has(idComoTexto(foto._id)));
  preencherOpcoes(selectFoto, fotosNoAlbum, 'Selecione uma foto', foto => foto.titulo);
  if (!fotosNoAlbum.length) selectFoto.options[0].textContent = 'Este álbum não tem fotos';
}

function iniciarAlbuns() {
  const form = document.getElementById('albumForm');
  const lista = document.getElementById('albuns');
  const modal = document.getElementById('albumModal');
  const modalFotos = document.getElementById('albumModalFotos');
  const modalTitulo = document.getElementById('albumModalTitle');
  const botaoFecharModal = document.getElementById('fecharAlbumModal');

  function fecharModal() {
    modal.hidden = true;
  }

  botaoFecharModal.addEventListener('click', fecharModal);
  modal.addEventListener('click', evento => {
    if (evento.target === modal) fecharModal();
  });
  document.addEventListener('keydown', evento => {
    if (evento.key === 'Escape' && !modal.hidden) fecharModal();
  });

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      const dados = Object.fromEntries(new FormData(form));
      const id = dados.id;
      delete dados.id;
      dados.usuarioId = usuarioAtual.id;
      const base = `/usuarios/${encodeURIComponent(usuarioAtual.id)}/albuns`;
      await requisicao(id ? `${base}/${encodeURIComponent(id)}` : base, id ? 'PUT' : 'POST', dados);
      resetarFormulario(form);
      await carregarAlbuns();
    });
  });
  lista.addEventListener('click', evento => {
    const botao = evento.target.closest('button[data-action]');
    if (!botao) return;
    if (botao.dataset.action === 'delete' && !window.confirm('Excluir este álbum?')) return;
    executar(async () => {
      const base = `/usuarios/${encodeURIComponent(usuarioAtual.id)}/albuns`;
      if (botao.dataset.action === 'view') {
        const album = await requisicao(`${base}/${encodeURIComponent(botao.dataset.id)}`);
        const fotos = await requisicao(`/usuarios/${encodeURIComponent(usuarioAtual.id)}/fotos`);
        const idsDasFotos = new Set((album.fotos || []).map(idComoTexto));
        const fotosDoAlbum = fotos.filter(foto => idsDasFotos.has(idComoTexto(foto._id)));

        modalTitulo.textContent = `Fotos: ${album.nome}`;
        modalFotos.replaceChildren();
        if (!fotosDoAlbum.length) {
          modalFotos.append(elemento('li', 'modal-empty', 'Este álbum ainda não tem fotos.'));
        } else {
          fotosDoAlbum.forEach(foto => {
            const item = elemento('li', 'album-photo-item');
            const imagem = document.createElement('img');
            imagem.src = foto.url;
            imagem.alt = '';
            imagem.loading = 'lazy';
            item.append(imagem, elemento('span', '', foto.titulo));
            modalFotos.append(item);
          });
        }
        modal.hidden = false;
        botaoFecharModal.focus();
        return;
      }
      if (botao.dataset.action === 'delete') {
        await requisicao(`${base}/${encodeURIComponent(botao.dataset.id)}`, 'DELETE');
        await carregarAlbuns();
        return;
      }
      const album = await requisicao(`${base}/${encodeURIComponent(botao.dataset.id)}`);
      resetarFormulario(form, true);
      form.elements.id.value = album._id;
      form.elements.nome.value = album.nome;
      form.elements.descricao.value = album.descricao || '';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, botao.dataset.action === 'edit'
      ? 'Dados carregados para edição.'
      : botao.dataset.action === 'view' ? 'Fotos do álbum carregadas.' : 'Álbum excluído com sucesso.');
  });
  form.querySelector('[data-cancel-edit]').addEventListener('click', () => resetarFormulario(form));
  const formAdicionar = document.getElementById('adicionarFotoAlbum');
  const formRemover = document.getElementById('removerFotoAlbum');
  formAdicionar.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      const albumId = formAdicionar.elements.albumId.value;
      const fotoId = formAdicionar.elements.fotoId.value;
      await requisicao(
        `/usuarios/${encodeURIComponent(usuarioAtual.id)}/albuns/${encodeURIComponent(albumId)}/fotos`,
        'POST',
        { fotoId }
      );
      await carregarAlbuns();
    });
  });
  formRemover.elements.albumId.addEventListener('change', () => executar(atualizarFotosRemover));
  formRemover.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      const albumId = formRemover.elements.albumId.value;
      const fotoId = formRemover.elements.fotoId.value;
      await requisicao(
        `/usuarios/${encodeURIComponent(usuarioAtual.id)}/albuns/${encodeURIComponent(albumId)}/fotos/${encodeURIComponent(fotoId)}`,
        'DELETE'
      );
      await carregarAlbuns();
    });
  });
  document.querySelector('[data-refresh]').addEventListener('click', () => executar(carregarAlbuns));
  executar(carregarAlbuns);
}

function renderizarFotos(fotos) {
  const lista = document.getElementById('fotos');
  lista.replaceChildren();
  if (!fotos.length) {
    lista.append(elemento('li', 'empty-state', 'Ainda não há fotos nesta biblioteca.'));
    return;
  }
  fotos.forEach(foto => {
    const card = elemento('li', 'photo-card');
    const imagem = document.createElement('img');
    imagem.src = foto.url;
    imagem.alt = foto.titulo;
    imagem.loading = 'lazy';
    imagem.addEventListener('error', () => { imagem.alt = `Não foi possível carregar: ${foto.titulo}`; });
    const copy = elemento('div', 'photo-copy');
    copy.append(elemento('strong', '', foto.titulo), elemento('p', '', foto.descricao || 'Sem descrição'));
    const acoes = elemento('div', 'record-actions');
    acoes.append(acaoBotao('Editar', '', 'edit', foto._id));
    acoes.append(acaoBotao('Excluir', 'delete-button', 'delete', foto._id));
    copy.append(acoes);
    card.append(imagem, copy);
    lista.append(card);
  });
}

async function carregarFotos() {
  const id = encodeURIComponent(usuarioAtual.id);
  renderizarFotos(await requisicao(`/usuarios/${id}/fotos`));
}

function iniciarFotos() {
  const form = document.getElementById('fotoForm');
  const lista = document.getElementById('fotos');
  form.addEventListener('submit', evento => {
    evento.preventDefault();
    executar(async () => {
      const dados = Object.fromEntries(new FormData(form));
      const id = dados.id;
      delete dados.id;
      dados.usuarioId = usuarioAtual.id;
      const base = `/usuarios/${encodeURIComponent(usuarioAtual.id)}/fotos`;
      await requisicao(id ? `${base}/${encodeURIComponent(id)}` : base, id ? 'PUT' : 'POST', dados);
      resetarFormulario(form);
      await carregarFotos();
    });
  });
  lista.addEventListener('click', evento => {
    const botao = evento.target.closest('button[data-action]');
    if (!botao) return;
    if (botao.dataset.action === 'delete' && !window.confirm('Excluir esta foto?')) return;
    executar(async () => {
      const base = `/usuarios/${encodeURIComponent(usuarioAtual.id)}/fotos`;
      if (botao.dataset.action === 'delete') {
        await requisicao(`${base}/${encodeURIComponent(botao.dataset.id)}`, 'DELETE');
        await carregarFotos();
        return;
      }
      const foto = await requisicao(`${base}/${encodeURIComponent(botao.dataset.id)}`);
      resetarFormulario(form, true);
      form.elements.id.value = foto._id;
      form.elements.titulo.value = foto.titulo;
      form.elements.url.value = foto.url;
      form.elements.descricao.value = foto.descricao || '';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, botao.dataset.action === 'edit' ? 'Dados carregados para edição.' : 'Foto excluída com sucesso.');
  });
  form.querySelector('[data-cancel-edit]').addEventListener('click', () => resetarFormulario(form));
  document.querySelector('[data-refresh]').addEventListener('click', () => executar(carregarFotos));
  executar(carregarFotos);
}

async function iniciar() {
  document.querySelectorAll('[data-logout]').forEach(botao => {
    botao.addEventListener('click', async () => {
      try { await requisicao('/auth/logout', 'POST', {}); }
      finally { window.location.href = 'login.html'; }
    });
  });

  try {
    const sessao = await requisicao('/auth/me');
    usuarioAtual = sessao.usuario;
  } catch {
    window.location.href = 'login.html';
    return;
  }

  document.querySelectorAll('[data-user-name]').forEach(node => { node.textContent = usuarioAtual.nome; });
  const pagina = document.body.dataset.page;
  if (pagina === 'home') {
    document.getElementById('nomeUsuario').textContent = usuarioAtual.nome;
    iniciarUsuarios();
  } else if (pagina === 'albums') iniciarAlbuns();
  else if (pagina === 'photos') iniciarFotos();
}

iniciar();