/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      // GET
      .get('/bonus-challenge/random', require('./controller/getRandomBonusChallenge')(db));
