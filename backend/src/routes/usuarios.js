const controller = require('../controllers/usuarioController');
const createRouter = require('./routeHelper');

module.exports = createRouter({
  'POST /usuarios': controller.create(true),
  'GET /usuarios': controller.findAll(true),
  'GET /usuarios/:id': controller.findById(true),
  'PUT /usuarios/:id': controller.update(true),
  'DELETE /usuarios/:id': controller.remove(true)
});
