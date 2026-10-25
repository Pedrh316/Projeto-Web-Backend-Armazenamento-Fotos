const { sendJson, sendError } = require('./http');
const autenticar = require('../middlewares/authentication')
const auth_messages = require('../constants/auth')

function createCrudController(model, entityName, options = {}) { 
  return {
    create: (validation = false) => async (req, res) => {
      if(validation) { if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})}
      try { return sendJson(res, 201, await model.create(req.body || {})); }
      catch (e) { return sendError(res, e); }
    },
    findAll:(validation = false) => async (req, res) => {
      if(validation) { if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})}
      try { return sendJson(res, 200, await model.findAll(options.filters ? req.query : undefined)); }
      catch (e) { return sendError(res, e); }
    },
    findById:(validation = false) => async (req, res) => {
      if(validation) { if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})}
      try {
        const item = await model.findById(req.params.id);
        return item ? sendJson(res, 200, item) : sendJson(res, 404, { erro: `${entityName} não encontrado(a).` });
      } catch (e) { return sendError(res, e); }
    },
    update:(validation = false) => async (req, res) => {
      if(validation) { if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})}
      try {
        const item = await model.update(req.params.id, req.body || {});
        return item ? sendJson(res, 200, item) : sendJson(res, 404, { erro: `${entityName} não encontrado(a).` });
      } catch (e) { return sendError(res, e); }
    },
    remove:(validation = false) => async (req, res) => {
      if(validation) { if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})}
      try {
        const result = await model.remove(req.params.id);
        if (!result.deletedCount) return sendJson(res, 404, { erro: `${entityName} não encontrado(a).` });
        res.writeHead(204);
        return res.end();
      } catch (e) { return sendError(res, e); }
    }
  };
}

module.exports = createCrudController;
