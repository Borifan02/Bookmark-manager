const express = require('express');
const router = express.Router();
const Bookmark = require('../models/bookmark');
const { fetchMetadata } = require('../utils/metadata');

// GET /bookmarks?search=&tags=tag1,tag2&archived=
router.get('/', async (req, res) => {
  try {
    const { search, tags, archived, sort } = req.query;
    const filter = {};
    if (typeof archived !== 'undefined') filter.archived = archived === 'true';
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length) filter.tags = { $all: tagList };
    }

    let q = Bookmark.find(filter);

    if (sort === 'recentlyVisited') q = q.sort({ lastVisited: -1 });
    else if (sort === 'mostVisited') q = q.sort({ viewCount: -1 });
    else if (sort === 'recentlyAdded') q = q.sort({ dateAdded: -1 });
    else q = q.sort({ dateAdded: -1 });

    const items = await q.exec();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    // normalize URL to include protocol
    if (payload.url && !/^https?:\/\//i.test(payload.url)) payload.url = 'http://' + payload.url;
    const exists = await Bookmark.findOne({ url: payload.url });
    if (exists) return res.status(409).json({ error: 'Bookmark with this URL already exists' });

    // enrich metadata if not provided
    if (!payload.title || !payload.favicon) {
      try {
        const meta = await fetchMetadata(payload.url);
        payload.title = payload.title || meta.title || payload.url;
        payload.favicon = payload.favicon || meta.favicon || '';
      } catch (e) {
        payload.title = payload.title || payload.url;
      }
    }

    const bm = new Bookmark(payload);
    await bm.save();
    res.status(201).json(bm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookmarks/exists?url=...
router.get('/exists', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url query' });
    // generate common normalized variants to detect duplicates regardless of protocol
    const variants = new Set();
    variants.add(url);
    if (!/^https?:\/\//i.test(url)) {
      variants.add('http://' + url);
      variants.add('https://' + url);
    } else {
      // add version without protocol
      variants.add(url.replace(/^https?:\/\//i, ''))
    }
    const arr = Array.from(variants);
    const bm = await Bookmark.findOne({ url: { $in: arr } }).lean();
    if (bm) return res.json({ exists: true, bookmark: bm });
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bm = await Bookmark.findById(req.params.id);
    if (!bm) return res.status(404).json({ error: 'Not found' });
    res.json(bm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /bookmarks/:id/pin { pinned: true }
router.patch('/:id/pin', async (req, res) => {
  try {
    const { pinned } = req.body;
    const bm = await Bookmark.findByIdAndUpdate(req.params.id, { pinned: !!pinned }, { new: true });
    if (!bm) return res.status(404).json({ error: 'Not found' });
    res.json(bm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /bookmarks/:id/archive { archived: true }
router.patch('/:id/archive', async (req, res) => {
  try {
    const { archived } = req.body;
    const bm = await Bookmark.findByIdAndUpdate(req.params.id, { archived: !!archived }, { new: true });
    if (!bm) return res.status(404).json({ error: 'Not found' });
    res.json(bm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.url && !/^https?:\/\//i.test(updates.url)) updates.url = 'http://' + updates.url;
    const bm = await Bookmark.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(bm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
