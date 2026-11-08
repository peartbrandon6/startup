const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const { WebSocket, WebSocketServer } = require('ws');

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
const chatDatabase = {
  messages: [],
  async getMessages() {
    return this.messages.map((message) => ({ ...message }));
  },
  async addMessage(message) {
    this.messages.push(message);
    if (this.messages.length > 100) {
      this.messages.shift();
    }
    return { ...message };
  },
};

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use('/api', apiRouter);

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

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
    const user = { username: normalizedUsername, password: passwordHash, token: randomUUID() };
    users.push(user);
    setAuthCookie(res, user.token);
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

  user.token = randomUUID();
  setAuthCookie(res, user.token);
  res.send({ username: user.username });
});

apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies.token;
  const user = users.find((candidate) => candidate.token === token);
  if (user) {
    delete user.token;
  }

  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(204).end();
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

apiRouter.get('/nutrition/:fruit', async (req, res) => {
  const fruit = req.params.fruit.trim();
  if (!fruit) {
    res.status(400).send({ msg: 'A fruit name is required' });
    return;
  }

  try {
    const response = await fetch(
      `https://www.fruityvice.com/api/fruit/${encodeURIComponent(fruit)}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (response.status === 404) {
      res.status(404).send({ msg: `No nutrition data found for "${fruit}"` });
      return;
    }
    if (!response.ok) {
      res.status(502).send({ msg: 'The nutrition service is temporarily unavailable' });
      return;
    }

    const fruitData = await response.json();
    if (
      typeof fruitData.name !== 'string' ||
      !fruitData.nutritions ||
      typeof fruitData.nutritions !== 'object'
    ) {
      res.status(502).send({ msg: 'The nutrition service returned invalid data' });
      return;
    }

    res.send({
      name: fruitData.name,
      family: fruitData.family,
      nutritions: fruitData.nutritions,
    });
  } catch (error) {
    console.error('Could not retrieve nutrition data from Fruityvice.', error);
    res.status(502).send({ msg: 'Could not reach the nutrition service' });
  }
});

apiRouter.delete('/fridge/items/:id', (req, res) => {
  const itemIndex = fridgeDatabase.items.findIndex((item) => item.id === req.params.id);
  if (itemIndex !== -1) {
    fridgeDatabase.items.splice(itemIndex, 1);
  }

  res.status(204).end();
});

apiRouter.get('/chat/messages', async (_req, res) => {
  res.send(await chatDatabase.getMessages());
});

const server = http.createServer(app);
const chatServer = new WebSocketServer({
  server,
  path: '/api/chat',
  maxPayload: 16 * 1024,
});

chatServer.on('connection', async (socket) => {
  socket.send(JSON.stringify({
    type: 'history',
    messages: await chatDatabase.getMessages(),
  }));

  socket.on('message', async (data) => {
    let request;
    try {
      request = JSON.parse(data.toString());
    } catch {
      socket.send(JSON.stringify({ type: 'error', msg: 'Message must be valid JSON' }));
      return;
    }

    if (!request || typeof request !== 'object' || Array.isArray(request)) {
      socket.send(JSON.stringify({ type: 'error', msg: 'Message must be a JSON object' }));
      return;
    }

    const username = typeof request.username === 'string' ? request.username.trim() : '';
    const text = typeof request.text === 'string' ? request.text.trim() : '';
    if (!username || username.length > 40 || !text || text.length > 500) {
      socket.send(JSON.stringify({
        type: 'error',
        msg: 'A username (up to 40 characters) and message (up to 500 characters) are required',
      }));
      return;
    }

    const message = await chatDatabase.addMessage({
      id: randomUUID(),
      username,
      text,
      timestamp: new Date().toISOString(),
    });
    const broadcast = JSON.stringify({ type: 'message', message });
    for (const client of chatServer.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(broadcast);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});