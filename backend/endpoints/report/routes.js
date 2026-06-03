/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getTodaysReports,
      getReportById,
      addReport,
      deleteReport
   } = require('./controller')(db);

   router.get('/report/today', getTodaysReports);
   router.get('/report/id/:id', getReportById);
   router.post('/report/add', addReport);
   router.delete('/report/delete', deleteReport)

   return router;
}