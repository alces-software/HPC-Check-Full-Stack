/**
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {

   return require('express').Router()
      .get('/rota', require('./controller/getAllRota')(db))
      .get('/rota/person/:id', require('./controller/getRotaByPerson')(db))
}