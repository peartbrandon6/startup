const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db(process.env.MONGODB_DB_NAME || 'startup');
const userCollection = db.collection('user');
const fridgeCollection = db.collection('fridgeItem');
const millisecondsPerDay = 24 * 60 * 60 * 1000;

function getUtcStartOfDay() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

async function migrateFridgeItemsToExpirationDates() {
  const legacyItems = await fridgeCollection
    .find({ expirationDate: { $exists: false }, daysUntilExpiration: { $type: 'number' } })
    .toArray();
  const today = getUtcStartOfDay();

  if (legacyItems.length) {
    await fridgeCollection.bulkWrite(
      legacyItems.map((item) => ({
        updateOne: {
          filter: { _id: item._id, expirationDate: { $exists: false } },
          update: {
            $set: {
              expirationDate: new Date(today + item.daysUntilExpiration * millisecondsPerDay),
            },
            $unset: { daysUntilExpiration: '' },
          },
        },
      }))
    );
  }
}

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

  await migrateFridgeItemsToExpirationDates();
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
  const { daysUntilExpiration, ...fridgeItem } = item;
  const expirationDate = new Date(
    getUtcStartOfDay() + daysUntilExpiration * millisecondsPerDay
  );

  try {
    await fridgeCollection.insertOne({ ...fridgeItem, expirationDate, username });
    return true;
  } catch (error) {
    if (error.code === 11000) {
      return false;
    }

    throw error;
  }
}

async function getFridgeItems(username) {
  const today = getUtcStartOfDay();
  const items = await fridgeCollection
    .find({ username })
    .sort({ _id: 1 })
    .toArray();

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    daysUntilExpiration: item.expirationDate instanceof Date
      ? Number(((item.expirationDate.getTime() - today) / millisecondsPerDay).toFixed(8))
      : item.daysUntilExpiration,
  }));
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