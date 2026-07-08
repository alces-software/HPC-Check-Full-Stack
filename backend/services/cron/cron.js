const cron = require('node-cron');

/**
 * Populates the closed days in the database
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startPopulateClosedDays = (db) =>
   cron.schedule('0 1 * * 1', () => require('../../schedule/scheduler').populateClosedDays(db));

/**
 * Generates the daily overview report
 * 0 11 1
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startDailyOverviewBuilder = (db) =>
   cron.schedule('* * * * *', () => require('../dailyReport/dailyReport')(db));
