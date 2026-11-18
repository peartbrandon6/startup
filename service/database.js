const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const fridgeCollection = db.collection('fridgeItem');

async function initializeDatabase() {
  await Promise.all([
    userCollection.createIndex({ username: 1 }, { unique: true }),
    fridgeCollection.createIndex({ username: 1, id: 1 }, { unique: true }),
  ]);

  try {
    await fridgeCollection.dropIndex('id_1');
  } catch (error) {
    if (error.code !== 27) {
      throw error;
    }
  }
}

function closeDatabase() {
  return client.close();
}

async function createUser(user) {
  try {
    await userCollection.insertOne(user);
    return true;
  } catch (error) {
    if (error.code === 11000) {
      return false;
    }

    throw error;
  }
}

function getUserByUsername(username) {
  return userCollection.findOne({ username });
}

function getUserByToken(token) {
  return token ? userCollection.findOne({ token }) : null;
}

function setUserToken(userId, token) {
  return userCollection.updateOne({ _id: userId }, { $set: { token } });
}

function clearUserToken(token) {
  return token
    ? userCollection.updateOne({ token }, { $unset: { token: '' } })
    : Promise.resolve();
}

async function addFridgeItem(username, item) {
  try {
    await fridgeCollection.insertOne({ ...item, username });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      return false;
    }

    throw error;
  }
}

function getFridgeItems(username) {
  return fridgeCollection
    .find({ username }, { projection: { _id: 0, username: 0 } })
    .sort({ _id: 1 })
    .toArray();
}

function deleteFridgeItem(username, id) {
  return fridgeCollection.deleteOne({ username, id });
}

module.exports = {
  addFridgeItem,
  clearUserToken,
  closeDatabase,
  createUser,
  deleteFridgeItem,
  getFridgeItems,
  getUserByToken,
  getUserByUsername,
  initializeDatabase,
  setUserToken,
};