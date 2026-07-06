/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      .get('/bonus-challenge/random', require('./controller/getRandomBonusChallenge')(db));

      