/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getTodaysReports,
      getTodaysReportByCluster,
      getReportWeek,
      getReportByCluster,
      getReportById,
      addReport
   } = require('./controller')(db);

   router.get('/report/today', getTodaysReports);
   router.get('/report/today/cluster/:id', getTodaysReportByCluster);
   router.get('/report/week', getReportWeek);
   router.get('/report/cluster/:id', getReportByCluster);
   router.get('/report/id/:id', getReportById);
   router.post('/report/add', addReport);

   return router;
}