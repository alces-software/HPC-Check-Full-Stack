/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getTodaysReports,
      getTodaysReportByCluster,
      getTodaysReportByPerson,
      getReportByPerson,
      getReportByCluster,
      getReportById,
      addReport,
      deleteReport
   } = require('./controller')(db);

   router.get('/report/today', getTodaysReports);
   router.get('/report/today/cluster/:id', getTodaysReportByCluster);
   router.get('/report/today/person/:id', getTodaysReportByPerson);
   router.get('/report/person/:id', getReportByPerson);
   router.get('/report/cluster/:id', getReportByCluster);
   router.get('/report/id/:id', getReportById);
   router.post('/report/add', addReport);
   router.delete('/report/delete', deleteReport)

   return router;
}