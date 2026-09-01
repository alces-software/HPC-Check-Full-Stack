const { ObjectId, Long } = require('mongodb');

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
         const { date: rawDate } = req.query || {};

         // Check date
         let date = null;
         if (rawDate !== undefined && rawDate !== null) {
            if (typeof rawDate !== 'string') {
               return res
                  .status(400)
                  .json({ success: false, error: 'The date provided is not a string' });
            }

            let tmpDate = rawDate.trim();

            if (tmpDate) {
               tmpDate = new Date(tmpDate);
               if (isNaN(tmpDate.getTime())) {
                  return res.status(400).json({ success: false, error: 'Invalid date provided' });
               }
               date = tmpDate;
            }
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

         // Get the overview report for today or a provided day
         const startOfDay = date || new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date(startOfDay);
         endOfDay.setHours(23, 59, 59, 999);

         const overviewReport = await db.collection('overviewReport').findOne({
            date: {
               $gte: Long.fromNumber(startOfDay.getTime()),
               $lt: Long.fromNumber(endOfDay.getTime())
            }
         });

         if (!overviewReport) {
            return res.status(200).json({ success: true, body: {} });
         }

         // Get reports
         const reports = await Promise.all(
            (overviewReport.reports ?? []).map(async (id) => {
               const report = await db.collection('report').findOne({
                  _id: new ObjectId(id)
               });

               if (!report) return null;

               const { _id, ...rest } = report;

               const results = await db
                  .collection('result')
                  .find({ reportId: _id.toString() })
                  .toArray();

               const ResultsWithTitles = await Promise.all(
                  results.map(async (data) => {
                     const instruction = await db
                        .collection('instruction')
                        .findOne({ _id: new ObjectId(data.instructionId) });

                     return {
                        title: instruction.title,
                        ...data
                     };
                  })
               );

               return {
                  id: _id.toString(),
                  person: people.find((p) => p.id === rest.personId)?.name,
                  cluster: cluster.find((c) => c.id === rest.clusterId)?.name,
                  ...rest,
                  results: ResultsWithTitles.filter((r) => r.note || !r.passed)
               };
            })
         );

         return res.status(200).json({
            success: true,
            body: {
               id: overviewReport._id.toString(),
               date: overviewReport.date,
               reports: reports,
               missing: overviewReport.missing
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
