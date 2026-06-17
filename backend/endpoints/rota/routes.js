/**
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {
   const scheduler = await require('./initialiseScheduler')(db);

   return require('express').Router()
      .get('/rota', require('./controller/getAllRota')(db, scheduler))
      .get('/rota/day/:day', require('./controller/getRotaByDay')(db, scheduler))
      .get('/rota/cluster/:id', require('./controller/getRotaByCluster')(db, scheduler))
      .get('/rota/person/:id', require('./controller/getRotaByPerson')(db, scheduler))
}