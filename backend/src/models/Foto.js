const { getDb } = require('../config/database');
const { toObjectId, requireString, validateUrl } = require('./helpers');

const collection = () => getDb().collection('fotos');
async function create(data) {
  const titulo = requireString(data.titulo, 'titulo');
  const url = validateUrl(requireString(data.url, 'url'));
  const doc = { titulo, url, descricao: typeof data.descricao === 'string' ? data.descricao.trim() : '', criadoEm: new Date() };
  doc.usuarioId = toObjectId(data.usuarioId);
  const result = await collection().insertOne(doc);
  return { _id: result.insertedId, ...doc };
}
async function findAll(filters = {}) {
  const query = {};
  if (filters.titulo) query.titulo = { $regex: String(filters.titulo), $options: 'i' };
  query.usuarioId = toObjectId(filters.usuarioId);
  return collection().find(query).sort({ criadoEm: -1 }).toArray();
}
async function findById(id) { return collection().findOne({ _id: toObjectId(id) }); }
async function update(id, data) {
  const fields = {};
  if (data.titulo !== undefined) fields.titulo = requireString(data.titulo, 'titulo');
  if (data.url !== undefined) fields.url = validateUrl(requireString(data.url, 'url'));
  if (data.descricao !== undefined) {
    if (typeof data.descricao !== 'string') { const e = new Error('O campo "descricao" deve ser texto.'); e.status = 400; throw e; }
    fields.descricao = data.descricao.trim();
  }
  fields.usuarioId = toObjectId(data.usuarioId);
  if (!Object.keys(fields).length) { const e = new Error('Informe ao menos um campo para atualizar.'); e.status = 400; throw e; }
  return collection().findOneAndUpdate({ _id: toObjectId(id) }, { $set: fields }, { returnDocument: 'after' });
}
async function remove(id) { return collection().deleteOne({ _id: toObjectId(id) }); }
module.exports = { create, findAll, findById, update, remove };
