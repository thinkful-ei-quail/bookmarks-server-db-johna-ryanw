/* eslint-disable eqeqeq */
const express = require('express');
const logger = require('../logger');

const validateBearerToken = require('../validateBearer');
const BookmarksService = require('../bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter.route('/').get((req, res, next) => {
  BookmarksService.getAllBookmarks(req.app.get('db'))
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});
/* .post(bodyParser, validateBearerToken, (req, res) => {
    //implementation logic here
    const { title, url, rating, desc = '' } = req.body;

    // validation
    if (!title) {
      logger.error('Title is required');
      return res.status(400).send('Title is required');
    }
    if (!url) {
      logger.error('URL is required');
      return res.status(400).send('URL is required');
    }
    if (!rating) {
      logger.error('Rating is required');
      return res.status(400).send('Rating is required');
    }

    // validate the url
    if (typeof url !== 'string') {
      logger.error('url must be a string');
      return res.status(400).send('url must be a string');
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      logger.error('url must be valid');
      return res.status(400).send('URL must be valid');
    }

    // validate the rating
    if (typeof rating !== 'number') {
      logger.error('rating must be a number');
      return res.status(400).send('rating must be a number');
    }

    if (rating < 1 || rating > 5) {
      logger.error('rating must be between 1 and 5');
      return res.status(400).send('rating must be between 1 and 5');
    }

    // Add to store

    // get an id

    const id = uuid();

    const newBookmark = {
      id,
      title,
      url,
      rating,
      desc,
    };

    bookmarks.push(newBookmark);

    logger.info(`New bookmark with ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${id}`)
      .json(newBookmark);
  }); */

bookmarkRouter
  .route('/bookmark/:id')
  .get((req, res) => {
    //implementation logic here
    const { id } = req.params;
    const bookmark = BookmarksService.getById(req.app.get('db'), id).find(
      (bm) => bm.id == id
    );

    // validate we found a bookmark
    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(400).send('Bookmark not found');
    }
    res.json(bookmark);
  })
  .delete(validateBearerToken, (req, res) => {
    // implementation logic here
    const { id } = req.params;
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) {
      logger.error('Invalid delete request');
      return res.status(400).send('Bookmark not found');
    }
    console.log(index, bookmarks);
    bookmarks.splice(index, 1);
    res.status(204).end();
    console.log(index, bookmarks);
  });

module.exports = bookmarkRouter;
