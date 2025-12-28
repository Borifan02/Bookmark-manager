const express = require('express');
const router = express.Router();
const Bookmark = require('../models/bookmark');

// GET /tags -> [{ tag, count }]
router.get('/', async (req, res) => {
  try {
    const tags = await Bookmark.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);
    res.json(tags.map(t => ({ tag: t._id, count: t.count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
