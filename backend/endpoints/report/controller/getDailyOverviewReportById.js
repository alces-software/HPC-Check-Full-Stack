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
         const { id } = req.params || {};

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing the report id' });
         }

         const sanitisedId = String(id).trim();

         if (sanitisedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The report id provided is empty' });
         }

         if (!ObjectId.isValid(sanitisedId)) {
            return res.status(400).json({ success: false, error: 'Invalid report id' });
         }

         // Get the overView report information
         const overviewReport = await db.collection('overviewReport').findOne({
            _id: new ObjectId(sanitisedId)
         });

         if (!overviewReport) {
            return res
               .status(404)
               .json({ success: false, error: 'There is no overview report for today' });
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

         // Get reports
         const reports = [];
         overviewReport.reports.each(async (id) =>
            reports.push(
               await db
                  .collection('report')
                  .find({
                     _id: new ObjectId(id)
                  })
                  .toArray()
                  .then(async (res) => {
                     res.map(async ({ _id, ...rest }) => ({
                        id: _id.toString(),
                        person: people.find((p) => p.id === rest.personId)?.name,
                        cluster: cluster.find((c) => c.id === rest.clusterId)?.name,
                        ...rest,
                        results: await db
                           .collection('result')
                           .find({
                              reportId: res._id.toString()
                           })
                           .toArray()
                           .then((res) =>
                              res
                                 .map((result) => ({
                                    instructionId: result.instructionId,
                                    passed: result.passed,
                                    note: result.note
                                 }))
                                 .filter((result) => {
                                    result.note.length > 0 || !result.passed;
                                 })
                           )
                     }));
                  })
            )
         );

         // Get which ones are missing
         const missingReports = [];
         overviewReport.missing.each(async (id) => {
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
