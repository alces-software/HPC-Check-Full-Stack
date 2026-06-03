/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getMethods,
      getMethodById
   } = require('./controller')(db);

   router.get('/method/:id', getMethods);
   router.get('/method/id/:id', getMethodById);

   return router;
}