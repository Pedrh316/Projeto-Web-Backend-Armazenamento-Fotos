
const { getDb } = require('../config/database');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const modelUsuario = require('../models/Usuario')

const users = () => getDb().collection('usuarios');

async function registrar(data) {
    return modelUsuario.create(data);
}

function criarToken(usuario) {
    return jwt.sign(
        { sub: usuario._id.toString() },
        process.env.JWT_SECRET,
        {
        algorithm: 'HS256',
        expiresIn: '15m'
        }
    );
}

async function login({ email, password }) {
    if ( typeof email !== 'string' || typeof password !== 'string' ) {
        const err = new Error('Email e password são obrigatórios.');
        err.status = 400;
        throw err;
    }
    const usuario = await users().findOne({ email: email.trim().toLowerCase() });
    
    if ( !usuario || !usuario.passwordHash || !(await bcrypt.compare(password, usuario.passwordHash)) ) {
        const err = new Error('Email ou password incorretos.');
        err.status = 401;
        throw err;
    }

    return {
        token: criarToken(usuario),
        usuario: { id: usuario._id.toString(), nome: usuario.nome, email: usuario.email }
    };
}

async function obterUsuario(id) {
    if (!ObjectId.isValid(id)) return null;
    const usuario = await users().findOne({ _id: new ObjectId(id) },{ projection: { passwordHash: 0 } });

    if (!usuario) return null;

    return {
        id: usuario._id.toString(),
        nome: usuario.nome,
        email: usuario.email
    };
}

module.exports = {
    registrar,
    login,
    obterUsuario
};
