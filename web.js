const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (index.html, styles.css, app.js, etc.)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`SEAM running at http://localhost:${PORT}`);
});
