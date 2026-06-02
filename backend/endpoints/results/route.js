/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      addResult
   } = require('./controller')(db);

   router.post('/result/submit', addResult);

   return router;
}