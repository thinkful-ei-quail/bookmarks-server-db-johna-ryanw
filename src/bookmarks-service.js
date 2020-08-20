const bookmarksService = {
  getAllBookmarks(knex) {
    return knex.select('*').from('bookmarks');
  },

  getById(knex, id) {
    return knex.from('bookmarks').select('*').where('id', id).first();
  },
};

module.exports = bookmarksService;
