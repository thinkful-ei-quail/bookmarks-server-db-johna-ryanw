/* eslint-disable quotes */
const { expect } = require('chai');
const supertest = require('supertest');
const knex = require('knex');

const app = require('../src/app');
const fixtures = require('./bookmarks-fixtures');

describe('Bookmarks Endpoints', function () {
  // set up hooks
  let db;
  before(`make knex instance`, () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after(`disconnect from db`, () => db.destroy());

  before(`clean the table`, () => db('bookmarks').truncate());

  afterEach('cleanup', () => db('bookmarks').truncate());

  describe(`GET /bookmarks`, () => {
    context(`Given there are bookmarks in the database`, () => {
      const testBookmarks = fixtures.makeBookmarksArray();

      beforeEach('insert articles', () => {
        return db.into('bookmarks').insert(testBookmarks);
      });

      // Happy Path
      it(`GET /bookmarks responds with 200 and all of the bookmarks`, () => {
        return supertest(app).get('/bookmarks').expect(200);
      });

      // Sad Path
      it(`GET /nonexistantbookmarks responds with 404`, () => {
        return supertest(app).get('/nonexistantbookmarks').expect(404);
      });
    });

    context(`Given there are no articles in the database`, () => {
      it(`responds with a 200 and an empty array`, () => {
        return supertest(app).get('/bookmarks').expect(200, []);
      });
    });
  });

  // TODO
  // describe(`GET /bookmarks/:bookmark_id`, () => {
  //   context(``)
  // })
});
