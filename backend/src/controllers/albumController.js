const createCrudController = require('./crudController');
const { sendJson, sendError } = require('./http');
const Album = require('../models/Album');
const crud = createCrudController(Album, 'Álbum', { filters: true });
const autenticar = require('../middlewares/authentication')

async function addPhoto(req, res) {
  if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})
  try {
    const album = await Album.addPhoto(req.params.id, req.body.fotoId);
    return album ? sendJson(res, 200, album) : sendJson(res, 404, { erro: 'Álbum não encontrado.' });
  } catch (e) { return sendError(res, e); }
}

async function removePhoto(req, res) {
  if(!autenticar(req,res)) return sendError(res, {"message":auth_messages["denied_access"]})
  try {
    const album = await Album.removePhoto(req.params.id, req.params.fotoId);
    return album ? sendJson(res, 200, album) : sendJson(res, 404, { erro: 'Álbum não encontrado.' });
  } catch (e) { return sendError(res, e); }
}

module.exports = { ...crud, addPhoto, removePhoto };
