module.exports = (db) =>
   require('express')
      .Router()

      .get('/check-focus/random', require('./controller/getRandomFocus')(db));
