const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDatabase() {
  const uri = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@database:27017/${process.env.MONGO_DATABASE_NAME}?authSource=admin`;
  const dbName = process.env.MONGO_DATABASE_NAME

  if (!uri) throw new Error('A variável MONGO_URI não foi definida.');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`MongoDB conectado. Banco: ${dbName}`);
  return db;
}

function getDb() {
  if (!db) throw new Error('Banco de dados ainda não conectado.');
  return db;
}

module.exports = { connectDatabase, getDb };
