/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      // GET
      .get('/report/today', require('./controller/getTodaysReports')(db))
      .get('/report/today/cluster/:id', require('./controller/getTodaysReportByCluster')(db))
      .get('/report/week', require('./controller/getWeeksReport')(db))
      .get('/report/cluster/:id', require('./controller/getReportByCluster')(db))
      .get('/report/id/:id', require('./controller/getReportById')(db))
      // POST
      .post('/report', require('./controller/addReport')(db));
