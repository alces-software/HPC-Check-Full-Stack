const cron = require('node-cron');
const Scheduler = require("../../schedule/scheduler")

/**
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startWeeklySchedule = async (db) => cron.schedule('* 1 * * 1', async () => {
   await Scheduler.populateClosedDays(db);
   console.log("Generated new schedule");
});