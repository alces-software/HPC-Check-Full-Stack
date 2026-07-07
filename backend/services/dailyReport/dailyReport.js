const { getDaily } = require('../../endpoints/rota/scheduleLogic');

/**
 * Generates the
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {
   // Get all the reports from today
   const startOfDay = new Date();
   startOfDay.setHours(0, 0, 0, 0);

   const endOfDay = new Date();
   endOfDay.setHours(23, 59, 59, 999);

   // Get the reports from the current day
   const reports = await db
      .collection('report')
      .find({
         startDate: {
            $gte: startOfDay.getTime(),
            $lte: endOfDay.getTime()
         }
      })
      .toArray()
      .then(async (res) => {
         res.map(async ({ _id, clusterId }) => ({
            id: _id.toString(),
            clusterId: clusterId
         }));
      });

   const rotaDaily = getDaily(db);
   const missingReports = [];

   if (rotaDaily.length != reports.length) {
      rotaDaily.each((person) => {
         const exists = reports.filter((report) => person.clusterId.includes(report.clusterId));

         if (!exists) {
            missingReports.push(
               person.clusterId.filter((clusterId) => clusterId != exists.clusterId)
            );
         }
      });
   }

   await db.collection('overviewReport').insertOne({
      date: new Date().getTime(),
      reports: reports.map((report) => report.id),
      missing: missingReports
   });
};
