/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => require('express').Router()
   // GET
   .get('/rota', require('./controller/getAllRota')(db))
   .get('/rota/day/:day', require('./controller/getRotaByDay')(db))
   .get('/rota/cluster/:id', require('./controller/getRotaByCluster')(db))
   .get('/rota/person/:id', require('./controller/getRotaByPerson')(db))
   .get('/rota/new', require('./controller/generateNewRota')(db));