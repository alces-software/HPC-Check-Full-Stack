/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      .get('/hpc-question/random', require('./controller/getRandomQuestion')(db))
      .post('/hpc-question/check', require('./controller/checkAnswer')(db));
