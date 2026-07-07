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

         // Check cluster id
         if (typeof clusterId !== 'string') {
            return res.status(400).json({ success: false, error: "The cluster id provided is not a string" });
         }

         if (!clusterId) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         const sanitizedClusterId = String(clusterId).trim();

         if (sanitizedClusterId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The person id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedClusterId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         const clusterExists = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedClusterId)
         });

         if (!clusterExists) {
            return res
               .status(404)
               .json({ success: false, error: 'The cluster specified does not exits' });
         }

         // Check person id
         if (typeof personId !== 'string') {
            return res.status(400).json({ success: false, error: "The persons id provided is not a string" });
         }

         if (!personId) {
            return res.status(400).json({ success: false, error: 'Missing persons id' });
         }

         const sanitizedPersonId = String(personId).trim();

         if (sanitizedPersonId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The person id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedPersonId)) {
            return res.status(400).json({ success: false, error: 'Invalid person id provided' });
         }

         const personExists = await db.collection('person').findOne({
            _id: new ObjectId(sanitizedPersonId)
         });

         if (!personExists) {
            return res
               .status(404)
               .json({ success: false, error: 'The person specified does not exits' });
         }

         // Check start time
         if (typeof startTime !== 'number') {
            return res.status(400).json({ success: false, error: "The start time provided is not a number" });
         }

         if (!startTime) {
            return res.status(400).json({ success: false, error: 'Missing start time' });
         }

         // Check end time
         if (typeof endTime !== 'number') {
            return res.status(400).json({ success: false, error: "The end time provided is not a number" });
         }

         if (!endTime) {
            return res.status(400).json({ success: false, error: 'Missing end time' });
         }

         // Check results
         if (!results) {
            return res.status(400).json({ success: false, error: 'Missing results' });
         }

         if (!Array.isArray(results)) {
            return res
               .status(400)
               .json({ success: false, error: "The results you've provided is not an array" });
         }

         if (results.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The results array provided is empty' });
         }

         // Check to make sure no report has been submitted for the cluster on that day
         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         const reportExists = await db.collection('report').findOne({
            clusterId: sanitizedClusterId,
            startDate: {
               $gte: startOfDay.getTime(),
               $lte: endOfDay.getTime()
            }
         });

         if (reportExists) {
            return res
               .status(409)
               .json({ success: false, error: 'A report already exists for this cluster' });
         }

         // Add the report to the database
         const reportId = await db
            .collection('report')
            .insertOne({
               clusterId: sanitizedClusterId,
               personId: sanitizedPersonId,
               startDate: Long.fromNumber(startTime),
               endDate: Long.fromNumber(endTime),
               passed: results.every((r) => r.passed)
            })
            .then((i) => i.insertedId.toString());

         if (!ObjectId.isValid(reportId)) {
            return res.status(500).json({
               success: false,
               error: 'Something went wrong adding the report to the database'
            });
         }

         // Add each section of results to the database
         const insertData = [];
         results.forEach((r) => {
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
