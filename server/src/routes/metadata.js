const express = require('express');
const router = express.Router();
const { fetchMetadata } = require('../utils/metadata');

// POST /metadata { url }
router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  try {
    const meta = await fetchMetadata(url);
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
