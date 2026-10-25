const { getDb } = require('../config/database');
const { toObjectId, requireString } = require('./helpers');
const bcrypt = require('bcryptjs')

const collection = () => getDb().collection('usuarios');

async function create(data) {
    const nome = requireString(data.nome, 'nome').trim();
    const email = requireString(data.email, 'email').trim().toLowerCase();
    const password = data.password;
    if(nome.length == ""){
        const err = new Error('O campo nome não pode estar vazio');
        err.status = 400;
        throw err;
    }
    if (typeof password !== 'string' || password.length < 8) {
        const err = new Error('A senha deve ter pelo menos 8 caracteres.');
        err.status = 400;
        throw err;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const err = new Error('E-mail inválido.');
        err.status = 400;
        throw err;
    }
    const existente = await collection().findOne({ email });
    if (existente) {
        const err = new Error('Já existe usuário com esse e-mail.');
        err.status = 409;
        throw err;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const doc = { nome, email, passwordHash, criadoEm: new Date() };
    const result = await collection().insertOne(doc);
    return { id: result.insertedId.toString(), nome, email };
}
async function findAll() { return collection().find({}).sort({ nome: 1 }).toArray(); }
async function findById(id) { return collection().findOne({ _id: toObjectId(id) }); }
async function update(id, data) {
    const _id = toObjectId(id);
    const fields = {};
    if (data.nome !== undefined) fields.nome = requireString(data.nome, 'nome');
    if (data.password !== undefined) fields.password = await bcrypt.hash(password, 12);
    if (data.email !== undefined) {
        fields.email = requireString(data.email, 'email').toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) { const e = new Error('E-mail inválido.'); e.status = 400; throw e; }
        const duplicate = await collection().findOne({ email: fields.email, _id: { $ne: _id } });
        if (duplicate) { const e = new Error('Já existe usuário com esse e-mail.'); e.status = 409; throw e; }
    }
    if (!Object.keys(fields).length) { const e = new Error('Informe ao menos nome ou email.'); e.status = 400; throw e; }
    const result = await collection().findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: 'after' });
    return result;
}
async function remove(id) { return collection().deleteOne({ _id: toObjectId(id) }); }
module.exports = { create, findAll, findById, update, remove };
