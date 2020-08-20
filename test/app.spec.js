/* eslint-disable quotes */
/* eslint-disable no-undef */
const app = require('../src/app');
const store = require('../src/store');
const supertest = require('supertest');

describe.skip('Bookmarks', () => {
  let bookmarksCopy;
  beforeEach('copy the bookmarks', () => {
    bookmarksCopy = store.bookmarks.slice();
  });

  afterEach('restore the bookmark', () => {
    store.bookmarks = bookmarksCopy;
  });

  describe('Unauthorized requests', () => {
    it('responds with 401 Unauthorized for POST /bookmark', () => {
      return supertest(app)
        .post('/bookmark')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for DELETE /bookmark/:id', () => {
      const aBookmark = store.bookmarks[1];
      return supertest(app)
        .delete(`/bookmark/${aBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' });
    });
  });

  describe('GET /bookmark', () => {
    it('gets the bookmarks from the store', () => {
      return supertest(app)
        .get('/bookmark')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, store.bookmarks);
    });
  });

  describe('GET /bookmark/:id', () => {
    it('gets the bookmark by ID from the store', () => {
      const secondBookmark = store.bookmarks[1];
      return supertest(app)
        .get(`/bookmark/${secondBookmark.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, secondBookmark);
    });

    it(`returns 400 when bookmark doesn't exist`, () => {
      return supertest(app)
        .get('/bookmark/doesnt-exist')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'Bookmark not found');
    });
  });

  describe('DELETE /bookmark/:id', () => {
    it('removes the bookmark by ID from the store', () => {
      const secondBookmark = store.bookmarks[1];
      const expectedBookmarks = store.bookmarks.filter(
        (s) => s.id !== secondBookmark.id
      );
      return supertest(app)
        .delete(`/bookmark/${secondBookmark.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(204)
        .then((res) => {
          supertest(app).get('/bookmark').expect(200, expectedBookmarks);
        });
    });

    it('returns 400 whe bookmark does not exist', () => {
      return supertest(app)
        .delete('/bookmark/doesnt-exist')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'Bookmark not found');
    });
  });

  describe('POST /bookmark', () => {
    it('responds with 400 missing title if not supplied', () => {
      const newBookmarkMissingTitle = {
        // title: 'test-title',
        url: 'https://test.com',
        rating: 1,
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmarkMissingTitle)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'Title is required');
    });

    it('responds with 400 missing url if not supplied', () => {
      const newBookmarkMissingUrl = {
        title: 'test-title',
        rating: 1,
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmarkMissingUrl)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'URL is required');
    });

    it('responds with 400 missing rating if not supplied', () => {
      const newBookmarkMissingRating = {
        title: 'test-title',
        url: 'https://test.com',
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmarkMissingRating)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'Rating is required');
    });

    it('responds with 400 invalid rating if not between 0 and 5', () => {
      const newBookmarkInvalidRating = {
        title: 'test-title',
        url: 'https://test.com',
        rating: 'invalid',
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmarkInvalidRating)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'rating must be a number');
    });

    it('responds with 400 invalid url if not a valid URL', () => {
      const newBookmarkInvalidUrl = {
        title: 'test-title',
        url: 'htp://invalid-url',
        rating: 1,
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmarkInvalidUrl)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, 'URL must be valid');
    });

    it('adds a new bookmark to the store', () => {
      const newBookmark = {
        title: 'test-title',
        url: 'https://test.com',
        desc: 'test description',
        rating: 1,
      };
      return supertest(app)
        .post('/bookmark')
        .send(newBookmark)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).to.eql(newBookmark.title);
          expect(res.body.url).to.eql(newBookmark.url);
          expect(res.body.desc).to.eql(newBookmark.desc);
          expect(res.body.rating).to.eql(newBookmark.rating);
          expect(res.body.id).to.be.a('string');
        })
        .then((res) => {
          supertest(app)
            .get(`/bookmark/${res.body.id}`)
            .expect(200, newBookmark);
        });
    });
  });
});
