# MongoDB with Node.js and Express — A Practical Learning Guide

I chose to learn how to use and implement MongoDB in a similar context to how I used json files in the previous programming project. I wanted to learn it specifically because I had heard about it before and was curious how real websites stored data and after researching I found out that mongoDB was used a lot in industry. It is also used in popular tech stacks such as MEAN (MongoDB, Express.js, Angular, Node.js) and MERN (MongoDB, Express.js, React, Node.js). 

This guide walks through how to integrate MongoDB Atlas into a Node.js and Express application, covering setup, CRUD operations, security, authentication, and search. It follows the same learning path I took when developing a clothes designer and supplier communication platform. This project suited mongoDB well because the app was all about storing, updating and searching data in a secure way.


## 1. Setting Up MongoDB Atlas

MongoDB Atlas is the cloud-hosted version of MongoDB. It offers a free lower-storage plan and requires no local installation.

**Set up Steps:**
1. Create an account at [mongodb.com](https://www.mongodb.com) and set up a free cluster (M0 tier).
2. Under **Database Access**, create a database user with a username and password. This is the credential your app will use to connect — it is separate from your Atlas account login.
3. Under **Network Access**, add your IP address to the allowlist. During development you can use `0.0.0.0/0` to allow connections from any IP, which is useful if you are working from multiple locations.
4. From the cluster dashboard, click **Connect** and select the **Node.js driver** option to get your connection string. You will need this to access the collection from your code.

MongoDB provides a useful starting point for this in their official tutorial:
> https://www.mongodb.com/resources/languages/mongodb-and-npm-tutorial

This walks through downloading an example Node.js application from the Atlas interface, which is worth doing before writing your own code as it shows the expected structure and syntax. I also recommend looking at the example app they have on the documentation to get an idea for the general structure of the process. There are many example applications from MongoDB and other independent tutorials but one I looked at was: https://github.com/mongodb/sample-app-nodejs-mflix/blob/main/README.md?plain=1

--- 

## 2. Connecting to Your Cluster from Express

Install the MongoDB Node.js driver and dotenv:

```
npm install mongodb dotenv
```

Store your connection string in a `.env` file — never hardcode credentials directly in your source files as they can end up in version control:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
```

Add `.env` to your `.gitignore` file so it is never committed to Git.

In your main server file, load the connection string and connect:

```javascript
require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db('your-database-name').collection('your-collection-name');
```

The `db` variable is now a reference to your collection and is what you use to run all queries. A collection in MongoDB is equivalent to a table in SQL — it holds all documents of a given type.

---

## 3. CRUD Operations

MongoDB documents are plain JavaScript objects. Each document is automatically assigned a unique `_id` field by MongoDB when it is inserted.

### Read — fetch all documents

```javascript
const results = await db.find({}).toArray();
```

Passing an empty object `{}` means no filter — return everything. The result is a cursor so `.toArray()` is needed to get a plain array.

### Create — insert a new document

```javascript
const result = await db.insertOne({ title: 'New Project', status: 'briefing' });
console.log(result.insertedId); // the auto-generated _id
```

### Update — modify an existing document

```javascript
const { ObjectId } = require('mongodb');

await db.updateOne(
  { _id: new ObjectId(id) },
  { $set: { status: 'production', notes: 'Updated notes' } }
);
```

### Delete - Delete documents by field value

```javascript
await db..deleteMany({ status: 'Briefing' });
```

With Delete, Insert, and Update there is the option to operate on one or multiple by changing between insertOne and insertMany for example.

`ObjectId` is required because MongoDB stores `_id` as a special type, not a plain string. When the `_id` arrives from the frontend as a string, it needs to be wrapped in `new ObjectId()` before querying. `$set` updates only the fields specified, leaving the rest of the document unchanged.

These three operations — `find`, `insertOne`, and `updateOne` — cover most use cases for a standard web app. Full reference for all driver methods is in the official documentation:
> https://www.mongodb.com/docs/drivers/node/current/

---

## 4. Securing Your Credentials

Two things are important here:

**Environment variables** — as covered above, use dotenv to keep your connection string out of your code. The `.env` file should contain your `MONGO_URI` and any other secrets such as admin passwords.

**IP Access List** — by default Atlas blocks all connections. During development, if you change network (e.g. home to university), you need to add your new IP in Atlas under **Network Access**. For an app that needs to be reachable from anywhere, set the allowlist entry to `0.0.0.0/0`.

Note the difference in what these two controls protect: the IP allowlist controls who can connect to your MongoDB cluster directly. Environment variables protect your credentials from being exposed in source code. Both are necessary.

---

## 5. Session-Based Authentication with Express

To restrict write operations to logged-in users, `express-session` can be used to manage login state via cookies.

```
npm install express-session
```

Add to your `.env`:

```
ADMIN_USER=admin
ADMIN_PASS=yourpassword
SESSION_SECRET=a-long-random-string
```

The `SESSION_SECRET` is used to cryptographically sign the session cookie. If someone tampers with the cookie value in their browser, the signature will not match and the server will reject it. It must remain constant for the duration of a session.

Set up the session middleware and a login route:

```javascript
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    req.session.loggedIn = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
});
```

Protect write routes with a middleware function:

```javascript
function requireAuth(req, res, next) {
  if (req.session.loggedIn) return next();
  res.status(401).json({ ok: false, error: 'Not logged in' });
}

app.post('/api/projects', requireAuth, async (req, res) => { ... });
app.patch('/api/projects/:id', requireAuth, async (req, res) => { ... });
```

Not setting a `maxAge` on the cookie means it is a session cookie — the browser deletes it automatically when closed. The server does not detect the browser closing; it simply stops receiving the cookie on future requests.

---

## 6. Search with $regex

MongoDB provides two main approaches to text search. The first, `$text`, uses a text index and word stemming, which is suited to natural language on large datasets but does not support partial word matching. The second, `$regex`, matches any substring within a field value and is better suited to small collections where users expect partial results.

To set up `$regex` search across multiple fields:

```javascript
app.get('/api/projects/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

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
});
```

**Parameter notes:**
- `$regex: q` — the pattern to match, used as a substring (no anchors, so it matches anywhere in the value)
- `$options: 'i'` — case-insensitive matching
- `$or` — required because `$regex` has no built-in awareness of multiple fields, unlike `$text` which uses a pre-defined index. Each field must be listed explicitly.

For further reading on MongoDB regex queries:
> https://www.mongodb.com/docs/manual/reference/operator/query/regex/
> https://oneuptime.com/blog/post/2026-03-31-mongodb-regex-queries/view

---

## Key Takeaways

- Always store credentials in `.env` and add it to `.gitignore` before writing any connection code
- MongoDB's `_id` is an `ObjectId` type — always wrap string IDs in `new ObjectId()` when querying
- IP allowlist and session auth protect different layers: Atlas-level connections vs. app-level routes
- `$text` search needs a text index and works on whole words; `$regex` needs no index and works on substrings — choose based on your dataset size and use case
- Always stop your development server with `Ctrl+C` before closing the terminal to avoid stale processes holding your port
