/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getMethods,
      getMethodById
   } = require('./controller')(db);

   router.get('/method/:instructionId', getMethods)
   router.get('/method/id/:methodId', getMethodById);

   return router;
}