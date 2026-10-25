const { getDb } = require('../config/database');
const { toObjectId, requireString } = require('./helpers');

const collection = () => getDb().collection('albuns');
async function create(data) {
  const nome = requireString(data.nome, 'nome');
  const doc = { nome, descricao: typeof data.descricao === 'string' ? data.descricao.trim() : '', fotos: [], criadoEm: new Date() };
  doc.usuarioId = toObjectId(data.usuarioId);
  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}
async function findAll(filters = {}) {
  const query = { usuarioId: toObjectId(filters.usuarioId) };
  return collection().find(query).sort({ nome: 1 }).toArray();
}
async function findById(id) { return collection().findOne({ _id: toObjectId(id) }); }
async function update(id, data) {
  const fields = {};
  if (data.nome !== undefined) fields.nome = requireString(data.nome, 'nome');
  if (data.descricao !== undefined) {
    if (typeof data.descricao !== 'string') { const e = new Error('O campo "descricao" deve ser texto.'); e.status = 400; throw e; }
    fields.descricao = data.descricao.trim();
  }
  fields.usuarioId = toObjectId(data.usuarioId);
  if (!Object.keys(fields).length) { const e = new Error('Informe ao menos um campo para atualizar.'); e.status = 400; throw e; }
  return collection().findOneAndUpdate({ _id: toObjectId(id) }, { $set: fields }, { returnDocument: 'after' });
}
async function addPhoto(id, fotoId) {
  const foto = toObjectId(fotoId);
  const exists = await getDb().collection('fotos').findOne({ _id: foto });
  if (!exists) { const e = new Error('Foto não encontrada.'); e.status = 404; throw e; }
  return collection().findOneAndUpdate({ _id: toObjectId(id) }, { $addToSet: { fotos: foto } }, { returnDocument: 'after' });
}
async function removePhoto(id, fotoId) {
  return collection().findOneAndUpdate({ _id: toObjectId(id) }, { $pull: { fotos: toObjectId(fotoId) } }, { returnDocument: 'after' });
}
async function remove(id) { return collection().deleteOne({ _id: toObjectId(id) }); }
module.exports = { create, findAll, findById, update, addPhoto, removePhoto, remove };
