const controller = require('../controllers/fotoController');
const createRouter = require('./routeHelper');

module.exports = createRouter({
  'POST /usuarios/:userId/fotos': controller.create(true),
  'GET /usuarios/:userId/fotos': controller.findAll(true),
  'GET /usuarios/:userId/fotos/:id': controller.findById(true),
  'PUT /usuarios/:userId/fotos/:id': controller.update(true),
  'DELETE /usuarios/:userId/fotos/:id': controller.remove(true)
});
