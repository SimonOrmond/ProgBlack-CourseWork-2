require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI is not set in .env');

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('seam').collection('projects');
  await db.createIndex(
    { title: 'text', supplier: 'text', notes: 'text' },
    { name: 'projects_text_search' }
  );
  console.log('Connected to MongoDB');
}

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function requireAuth(req, res, next) {
  if (req.session.loggedIn) return next();
  res.status(401).json({ ok: false, error: 'Not logged in' });
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    req.session.loggedIn = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth', (req, res) => {
  res.json({ loggedIn: !!req.session.loggedIn });
});

app.get('/api/projects/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  try {
    const regex = { $regex: q, $options: 'i' };
    const results = await db.find({
      $or: [
        { title: regex },
        { supplier: regex },
        { notes: regex },
        { status: regex },
      ]
    }).toArray();
    res.json(results.map(p => ({ ...p, _id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.find({}).toArray();
    res.json(projects.map(p => ({ ...p, _id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { _id, ...fields } = req.body;
    await db.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: fields }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const result = await db.insertOne(req.body);
    res.json({ ok: true, _id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(express.static(path.join(__dirname)));

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SEAM running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
