function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  return res.end(data === undefined ? '' : JSON.stringify(data));
}

function sendError(res, error) {
  return sendJson(res, error.status || 500, { erro: error.message || 'Erro interno.' });
}

module.exports = { sendJson, sendError };
