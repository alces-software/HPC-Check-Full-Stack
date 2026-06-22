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

         const report = await db.collection('report').findOne({
            _id: new ObjectId(sanitisedId)
         });

         if (!report) {
            return res.status(404).json({ success: false, error: "Report doesn't exist" });
         }

         const results = await db
            .collection('result')
            .find({
               reportId: sanitisedId
            })
            .toArray();

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

         return res.status(200).json({
            success: true,
            body: {
               id: sanitisedId,
               clusterId: report.clusterId,
               cluster: cluster.find((c) => c.id === report.clusterId)?.name,
               personId: report.personId,
               person: people.find((p) => p.id === report.personId)?.name,
               startTime: report.startDate,
               endTime: report.endDate,
               passed: report.passed,
               results: results.map((result) => ({
                  instructionId: result.instructionId,
                  passed: result.passed,
                  note: result.note
               }))
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
