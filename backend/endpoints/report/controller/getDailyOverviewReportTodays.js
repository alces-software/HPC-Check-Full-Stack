const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   return async (req, res) => {
      try {
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

         // Check to make sure no report has been submitted for the cluster on that day
         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         // Get the overView report information
         const overviewReport = await db.collection('overviewReport').findOne({
            date: {
               $gte: startOfDay.getTime(),
               $lte: endOfDay.getTime()
            }
         });

         if (!overviewReport) {
            return res
               .status(404)
               .json({ success: false, error: 'There is no overview report for today' });
         }

         // Get reports
         const reports = await Promise.all(
            (overviewReport.reports ?? []).map(async (id) => {
               const report = await db.collection("report").findOne({
                  _id: new ObjectId(id),
               });

               if (!report) return null;

               const { _id, ...rest } = report;

               const results = await db
                  .collection("result")
                  .find({ reportId: _id.toString() })
                  .toArray();

               return {
                  id: _id.toString(),
                  person: people.find((p) => p.id === rest.personId)?.name,
                  cluster: cluster.find((c) => c.id === rest.clusterId)?.name,
                  ...rest,
                  results: results
                     .map((r) => ({
                        instructionId: r.instructionId,
                        passed: r.passed,
                        note: r.note,
                     }))
                     .filter((r) => r.note || !r.passed),
               };
            })
         );

         // Get which ones are missing
         const missingReports = [];
         overviewReport.missing.forEach(async (id) => {
            missingReports.push({
               id: id,
               name: cluster.find((c) => c.id === id)?.name
            });
         });

         return res.status(200).json({
            success: true,
            body: {
               id: overviewReport._id.toString(),
               date: overviewReport.date,
               reports: reports,
               missing: missingReports
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
