const request = require('supertest');
jest.mock('../src/models/bookmark');
const Bookmark = require('../src/models/bookmark');
const { createApp } = require('../src/app');

let app;

beforeAll(() => {
  app = createApp();
});

beforeEach(() => {
  Bookmark.__resetMock();
});

test('creates a bookmark', async () => {
  const res = await request(app)
    .post('/bookmarks')
    .send({ url: 'https://example.com', title: 'Example' })
    .expect(201);
  expect(res.body).toHaveProperty('_id');
  const inDb = await Bookmark.findById(res.body._id);
  expect(inDb).not.toBeNull();
  expect(inDb.url).toMatch(/https?:\/\/example.com/);
});

test('exists endpoint detects bookmark variants', async () => {
  await Bookmark.create({ url: 'https://example.com', title: 'Example' });
  const res = await request(app)
    .get('/bookmarks/exists')
    .query({ url: 'example.com' })
    .expect(200);
  expect(res.body.exists).toBe(true);
});

test('redirect increments viewCount and redirects', async () => {
  const bm = await Bookmark.create({ url: 'https://example.com', title: 'Example', viewCount: 0 });
  const res = await request(app)
    .get(`/r/${bm._id}`)
    .expect(302);
  expect(res.headers.location).toMatch(/https?:\/\/example.com/);
  const updated = await Bookmark.findById(bm._id);
  expect(updated.viewCount).toBe(1);
  expect(updated.lastVisited).toBeTruthy();
});
