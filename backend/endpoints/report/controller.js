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
   async function getTodaysReports(req, res) {
      try {
         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         const response = await db.collection('report').find({
            startDate: {
               $gte: startOfDay.getTime(),
               $lte: endOfDay.getTime()
            }
         }).toArray().then(result => {
            return result.map(({ _id, ...rest }) => ({
               ...rest,
               id: _id.toString()
            }));
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getTodaysReportByCluster(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const response = await db.collection('report').find({
               clusterId: id,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
               }
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: "Missing cluster id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
   async function getTodaysReportByPerson(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
            }

            const response = await db.collection('report').find({
               personId: id,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
               }
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: "Missing person id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getReportByPerson(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
            }

            const response = await db.collection('report').find({
               personId: id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: "Missing person id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getReportByCluster(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const response = await db.collection('report').find({
               clusterId: id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: "Missing cluster id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getReportById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: 'Invalid report id' });
            }

            const report = await db.collection('report').findOne({
               _id: new ObjectId(id)
            });

            if (!report) {
               return res.status(404).json({ success: false, error: "Report doesn't exist" });
            }

            const results = await db.collection('result').find({
               reportId: id
            }).toArray();

            return res.status(200).json({
               success: true,
               body: {
                  id,
                  clusterId: report.clusterId,
                  personId: report.personId,
                  startTime: report.startDate,
                  endTime: report.endDate,
                  results: results.map((result) => ({
                     instructionId: result.instructionId,
                     passed: result.passed,
                     note: result.note
                  }))
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function addReport(req, res) {
      try {
         const { clusterId, personId, startTime, endTime, results } = req.body || {};

         if (clusterId && personId && startTime && endTime && results) {
            if (!ObjectId.isValid(clusterId)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const reportExists = await db.collection('report').findOne({
               clusterId: clusterId,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
               }
            });

            if (reportExists) {
               return res.status(409).json({ success: false, error: "A report already exists for this cluster" });
            }

            const clusterExists = await db.collection('cluster').findOne({
               _id: new ObjectId(clusterId)
            });

            if (!clusterExists) {
               return res.status(404).json({ success: false, error: "The cluster specified does not exits" });
            }

            if (!ObjectId.isValid(personId)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
            }

            const personExists = await db.collection('person').findOne({
               _id: new ObjectId(personId)
            });

            if (!personExists) {
               return res.status(404).json({ success: false, error: "The person specified does not exits" });
            }

            if (!Array.isArray(results)) {
               return res.status(400).json({ success: false, error: "The results you've provided is not an array" });
            }

            const reportId = await db.collection('report').insertOne({
               clusterId: clusterId,
               personId: personId,
               startDate: Long.fromNumber(startTime),
               endDate: Long.fromNumber(endTime)
            }).then(i => {
               return i.insertedId.toString();
            });

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
         }

         return res.status(400).json({ success: false, error: "Invalid data is being passed in" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteReport(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid report id provided" });
            }

            const reportExists = await db.collection('report').findOneAndDelete({
               _id: new ObjectId(id)
            });

            if (!reportExists) {
               return res.status(404).json({ success: false, error: "No report exists with that id" });
            }

            await db.collection('result').deleteMany({
               reportId: id
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: "Missing report id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getTodaysReports,
      getTodaysReportByCluster,
      getTodaysReportByPerson,
      getReportByPerson,
      getReportByCluster,
      getReportById,
      addReport,
      deleteReport
   }
}