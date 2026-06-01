/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const { getRota, updateRota } = require('./controller')(db);

   router.get('/rota', getRota);
   router.put('/rota', updateRota);

   return router;
}