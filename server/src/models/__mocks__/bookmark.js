const mongoose = require('mongoose');

const store = new Map();

function makeId() {
  return new mongoose.Types.ObjectId().toString();
}

function normalizeUrl(u) {
  if (!u) return u;
  if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
  try { return new URL(u).toString(); } catch (e) { return u; }
}

function BookmarkMock(doc) {
  const _id = (doc && doc._id) ? doc._id : makeId();
  this._doc = Object.assign({}, doc, { _id, url: normalizeUrl(doc && doc.url), viewCount: (doc && doc.viewCount) || 0 });
}

BookmarkMock.prototype.save = async function () {
  store.set(this._doc._id.toString(), this._doc);
  return this._doc;
};

BookmarkMock.prototype.toJSON = function () {
  return this._doc;
};

BookmarkMock.prototype.toObject = function () {
  return this._doc;
};

BookmarkMock.__resetMock = function () {
  store.clear();
};

BookmarkMock.create = async function (doc) {
  const id = makeId();
  const out = Object.assign({}, doc, { _id: id, url: normalizeUrl(doc.url), viewCount: doc.viewCount || 0 });
  store.set(id, out);
  return out;
};

BookmarkMock.findById = function (id) {
  const key = id && id.toString ? id.toString() : id;
  const doc = store.get(key) || null;
  return Promise.resolve(doc);
};

BookmarkMock.findByIdAndUpdate = function (id, update, opts) {
  const key = id && id.toString ? id.toString() : id;
  const cur = store.get(key);
  if (!cur) return {
    lean() { return Promise.resolve(null); }
  };
  if (update.$inc && typeof update.$inc.viewCount === 'number') {
    cur.viewCount = (cur.viewCount || 0) + update.$inc.viewCount;
  }
  if (update.$set && update.$set.lastVisited) {
    cur.lastVisited = update.$set.lastVisited;
  }
  store.set(key, cur);
  return {
    lean() { return Promise.resolve(cur); }
  };
};

BookmarkMock.deleteMany = async function () {
  store.clear();
  return { deletedCount: 0 };
};

BookmarkMock.findOne = function (query) {
  if (!query) return {
    lean() { return Promise.resolve(null); }
  };
  const qUrl = query.url;
  let found = null;
  for (const [k, v] of store.entries()) {
    if (qUrl) {
      if (qUrl.$in && Array.isArray(qUrl.$in)) {
        if (qUrl.$in.includes(v.url) || qUrl.$in.some(x => v.url.includes(x))) { found = v; break; }
      } else if (typeof qUrl === 'string') {
        if (v.url === qUrl || v.url.includes(qUrl)) { found = v; break; }
      }
    }
    if (Array.isArray(query.$or)) {
      for (const cond of query.$or) {
        if (cond.url && cond.url.$regex) {
          const rx = new RegExp(cond.url.$regex, 'i');
          if (rx.test(v.url)) { found = v; break; }
        }
      }
      if (found) break;
    }
  }
  const promise = Promise.resolve(found);
  return {
    then: (resolve, reject) => promise.then(resolve, reject),
    catch: (r) => promise.catch(r),
    lean() { return Promise.resolve(found); }
  };
};

module.exports = BookmarkMock;
