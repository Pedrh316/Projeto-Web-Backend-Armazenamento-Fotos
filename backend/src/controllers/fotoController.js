const createCrudController = require('./crudController');
module.exports = createCrudController(require('../models/Foto'), 'Foto', { filters: true });
