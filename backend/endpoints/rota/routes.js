/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getAllRota,
      getRotaByDay,
      getRotaByCluster,
      getRotaByPerson
   } = require('./controller')(db);

   router.get('/rota', getAllRota);
   router.get('/rota/day/:day', getRotaByDay);
   router.get('/rota/cluster/:id', getRotaByCluster);
   router.get('/rota/person/:id', getRotaByPerson);

   return router;
}