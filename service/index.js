const bcrypt = require('bcryptjs');
const express = require('express');

const app = express();
const users = [];
const fridgeDatabase = {
  items: [
    { id: 'seed-milk', name: 'Milk', daysUntilExpiration: 5 },
    { id: 'seed-eggs', name: 'Eggs', daysUntilExpiration: 12 },
    { id: 'seed-spinach', name: 'Spinach', daysUntilExpiration: 3 },
  ],
  async getItems() {
    return this.items.map((item) => ({ ...item }));
  },
};
const creatingUsernames = new Set();
const apiRouter = express.Router();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRouter);

apiRouter.post('/auth/create', async (req, res) => {
  const { username, password } = req.body || {};
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    res.status(400).send({ msg: 'Username and password are required' });
    return;
  }

  const normalizedUsername = username.trim();
  if (
    creatingUsernames.has(normalizedUsername) ||
    users.some((user) => user.username === normalizedUsername)
  ) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }

  creatingUsernames.add(normalizedUsername);
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    users.push({ username: normalizedUsername, password: passwordHash });
  } finally {
    creatingUsernames.delete(normalizedUsername);
  }

  res.status(201).send({ username: normalizedUsername });
});

apiRouter.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    res.status(400).send({ msg: 'Username and password are required' });
    return;
  }

  const user = users.find((candidate) => candidate.username === username.trim());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }

  res.send({ username: user.username });
});

apiRouter.post('/fridge/items', (req, res) => {
  const { id, name, daysUntilExpiration } = req.body || {};
  if (
    typeof id !== 'string' ||
    !id.trim() ||
    typeof name !== 'string' ||
    !name.trim() ||
    typeof daysUntilExpiration !== 'number' ||
    !Number.isFinite(daysUntilExpiration) ||
    daysUntilExpiration < 0
  ) {
    res.status(400).send({ msg: 'A valid item ID, name, and expiration days are required' });
    return;
  }

  if (fridgeDatabase.items.some((item) => item.id === id)) {
    res.status(409).send({ msg: 'Fridge item already exists' });
    return;
  }

  const item = { id, name: name.trim(), daysUntilExpiration };
  fridgeDatabase.items.push(item);
  res.status(201).send(item);
});

apiRouter.get('/fridge/items', async (_req, res) => {
  res.send(await fridgeDatabase.getItems());
});

apiRouter.delete('/fridge/items/:id', (req, res) => {
  const itemIndex = fridgeDatabase.items.findIndex((item) => item.id === req.params.id);
  if (itemIndex !== -1) {
    fridgeDatabase.items.splice(itemIndex, 1);
  }

  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});