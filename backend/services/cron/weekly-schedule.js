const cron = require('node-cron');

/**
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startWeeklySchedule = (db) => {
   return cron.schedule('* 1 * * 1', () => {
      console.log("New schedule");
   });
}