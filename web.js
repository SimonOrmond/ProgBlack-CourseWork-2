const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI ||
  'mongodb+srv://simonormond06:salt1Sugarm!@cluster0.b87474g.mongodb.net/?appName=Cluster0';

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('seam').collection('projects');
  console.log('Connected to MongoDB');
}

app.use(express.json());

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.find({}).toArray();
    res.json(projects.map(p => ({ ...p, _id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
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

app.post('/api/projects', async (req, res) => {
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
