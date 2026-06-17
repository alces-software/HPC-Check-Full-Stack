/**
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {

   return require('express').Router()
      .get('/rota', require('./controller/getAllRota')(db))
      .get('/rota/person/:id', require('./controller/getRotaByPerson')(db))
      .get('/rota/week/:date', require('./controller/getRotaByWeek')(db))
}