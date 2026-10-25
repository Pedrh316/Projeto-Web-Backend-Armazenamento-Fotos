module.exports = function createRouter(routes) {
  return function router(req, res) {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const parts = pathname.split('/').filter(Boolean);

    for (const [key, handler] of Object.entries(routes)) {
      const [method, route] = key.split(' ');
      const expected = route.split('/').filter(Boolean);
      if (method !== req.method || parts.length !== expected.length) continue;

      const params = {};
      const matches = expected.every((part, i) => {
        if (part.startsWith(':')) { params[part.slice(1)] = decodeURIComponent(parts[i]); return true; }
        return part === parts[i];
      });
      if (!matches) continue;

      req.params = params;
      if (params.userId) {
        req.query = { ...req.query, usuarioId: req.query?.usuarioId || params.userId };
        req.body = { ...req.body, usuarioId: req.body?.usuarioId || params.userId };
      }
      return handler(req, res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
  };
};
