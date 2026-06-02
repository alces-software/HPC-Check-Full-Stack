/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getReportById,
      addReport
   } = require('./controller')(db);

   router.get('/report/id/:id', getReportById);
   router.post('/report/add', addReport);

   return router;
}