/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      // GET
      .get('/check-focus/random', require('./controller/getRandomFocus')(db));
