const express = require('express');
const cors = require('cors');

function createApp() {
  const app = express();
  // Enable CORS for all routes (allows frontend dev server to call API)
  app.use(cors());
  app.use(express.json());

  const bookmarksRouter = require('./routes/bookmarks');
  const tagsRouter = require('./routes/tags');
  const metadataRouter = require('./routes/metadata');
  const redirectRouter = require('./routes/redirect');

  app.use('/bookmarks', bookmarksRouter);
  app.use('/tags', tagsRouter);
  app.use('/metadata', metadataRouter);
  app.use('/r', redirectRouter);

  app.get('/', (req, res) => res.json({ ok: true }));

  return app;
}

module.exports = { createApp };
