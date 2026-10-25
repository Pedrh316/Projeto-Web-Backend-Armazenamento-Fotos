const { ObjectId } = require('mongodb');

function toObjectId(id) {
  if (!ObjectId.isValid(id) || String(new ObjectId(id)) !== String(id)) {
    const error = new Error('ID inválido.');
    error.status = 400;
    throw error;
  }
  return new ObjectId(id);
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    const error = new Error(`O campo "${field}" é obrigatório e deve ser texto.`);
    error.status = 400;
    throw error;
  }
  return value.trim();
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    const error = new Error('O campo "url" deve ser uma URL HTTP ou HTTPS válida.');
    error.status = 400;
    throw error;
  }
}

module.exports = { toObjectId, requireString, validateUrl };
