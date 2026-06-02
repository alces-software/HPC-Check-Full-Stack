/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getAllInstructionsData
   } = require('./controller')(db);

   router.get('/instructions/:clusterId', getAllInstructionsData);

   return router;
}