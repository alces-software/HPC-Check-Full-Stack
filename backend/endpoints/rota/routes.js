/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const { getRota } = require('./controller')(db);

   router.get('/rota', getRota);

   return router;
}