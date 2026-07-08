const { Long } = require('mongodb');
const { getDaily } = require('../../endpoints/rota/scheduleLogic');

/**
 * Generates the
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {
   // Get all the reports from today
   const startOfDay = new Date().setHours(0, 0, 0, 0);
   const endOfDay = new Date().setHours(23, 59, 59, 999);

   // Check to see if a report exists already and if one does exit out
   const reportExists = await db.collection('overviewReport').findOne({
      date: {
         $gte: startOfDay,
         $lte: endOfDay
      }
   });

   if (reportExists) {
      return;
   }

   // Get people
   const people = await db
      .collection('person')
      .find({})
      .toArray()
      .then((res) =>
         res.map((data) => ({
            id: data._id.toString(),
            name: data.name
         }))
      );

   // Get clusters
   const cluster = await db
      .collection('cluster')
      .find({})
      .toArray()
      .then((res) =>
         res.map((data) => ({
            id: data._id.toString(),
            name: data.name
         }))
      );

   // Get the reports from the current day
   const reports = await db
      .collection('report')
      .find({
         startDate: {
            $gte: startOfDay,
            $lte: endOfDay
         }
      })
      .toArray()
      .then((res) =>
         res.map(({ _id, clusterId }) => ({
            id: _id.toString(),
            clusterId: clusterId
         }))
      );

   const rotaDaily = await getDaily(db).then((res) =>
      Object.entries(res).map(([key, value]) => ({
         id: key,
         clusterId: value
      }))
   );

   const missingReports = [];
   if (rotaDaily.length != reports.length) {
      rotaDaily.forEach((person) => {
         const exists = reports.filter((report) => person.clusterId.includes(report.clusterId));
         if (exists.length !== 1) {
            person.clusterId.forEach((id) => {
               missingReports.push({
                  clusterId: id,
                  personId: person.id,
                  person: people.find((p) => p.id === person.id)?.name,
                  cluster: cluster.find((c) => c.id === id)?.name
               });
            });
         }
      });
   }

   await db.collection('overviewReport').insertOne({
      date: Long.fromNumber(new Date().getTime()),
      reports: reports.map((report) => report.id),
      missing: missingReports
   });
};
