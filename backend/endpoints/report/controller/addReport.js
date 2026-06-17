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
         const { clusterId, personId, startTime, endTime, results } = req.body || {};

         if (!clusterId) {
            return res.status(400).json({ success: false, error: "Missing cluster id" });
         }

         if (!personId) {
            return res.status(400).json({ success: false, error: "Missing persons id" });
         }

         if (!startTime) {
            return res.status(400).json({ success: false, error: "Missing start time" });
         }

         if (!endTime) {
            return res.status(400).json({ success: false, error: "Missing end time" });
         }

         if (!results) {
            return res.status(400).json({ success: false, error: "Missing results" });
         }

         if (!ObjectId.isValid(clusterId)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         const reportExists = await db.collection('report')
            .findOne({
               clusterId: clusterId,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
               }
            });

         if (reportExists) {
            return res.status(409).json({ success: false, error: "A report already exists for this cluster" });
         }

         const clusterExists = await db.collection('cluster')
            .findOne({
               _id: new ObjectId(clusterId)
            });

         if (!clusterExists) {
            return res.status(404).json({ success: false, error: "The cluster specified does not exits" });
         }

         if (!ObjectId.isValid(personId)) {
            return res.status(400).json({ success: false, error: "Invalid person id provided" });
         }

         const personExists = await db.collection('person')
            .findOne({
               _id: new ObjectId(personId)
            });

         if (!personExists) {
            return res.status(404).json({ success: false, error: "The person specified does not exits" });
         }

         if (!Array.isArray(results)) {
            return res.status(400).json({ success: false, error: "The results you've provided is not an array" });
         }

         const reportId = await db.collection('report')
            .insertOne({
               clusterId: clusterId,
               personId: personId,
               startDate: Long.fromNumber(startTime),
               endDate: Long.fromNumber(endTime),
               passed: results.every(r => r.passed)
            })
            .then(i =>
               i.insertedId.toString()
            );

         if (!ObjectId.isValid(reportId)) {
            return res.status(500).json({ success: false, error: "Something went wrong adding the report to the database" });
         }

         const insertData = [];
         results.forEach(r => {
            insertData.push({
               instructionId: r.instructionId,
               reportId: reportId,
               passed: r.passed,
               note: r.note
            });
         });

         await db.collection('result').insertMany(insertData);

         return res.status(200).json({ success: true, body: { reportId: reportId } });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};