const cron = require('node-cron');
const { generateSchedule } = require("./methods/generate-schedule")

/**
 * @param {import('mongodb').Db} db
 * @returns {import('node-cron').ScheduledTask}
 */
module.exports.startWeeklySchedule = async (db) => {
   return cron.schedule('* 1 * * 1', async () => {
      await generateSchedule(db);
      console.log("Generated new schedule");
   });
}