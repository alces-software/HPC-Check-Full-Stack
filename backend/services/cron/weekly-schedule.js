const cron = require('node-cron');
const { generateSchedule } = require("./methods/schedule")

/**
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startWeeklySchedule = async (db) => cron.schedule('* 1 * * 1', async () => {
   await generateSchedule(db);
   console.log("Generated new schedule");
});