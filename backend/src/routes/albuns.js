const controller = require('../controllers/albumController');
const createRouter = require('./routeHelper');

module.exports = createRouter({
  'POST /usuarios/:userId/albuns': controller.create(true),
  'GET /usuarios/:userId/albuns': controller.findAll(true),
  'GET /usuarios/:userId/albuns/:id': controller.findById(true),
  'PUT /usuarios/:userId/albuns/:id': controller.update(true),
  'DELETE /usuarios/:userId/albuns/:id': controller.remove(true),
  'POST /usuarios/:userId/albuns/:id/fotos': controller.addPhoto,
  'DELETE /usuarios/:userId/albuns/:id/fotos/:fotoId': controller.removePhoto
});
