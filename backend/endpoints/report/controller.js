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

         const response = await collection.find({
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
   async function getReportById(req, res) {
      try {
         const { id } = req.params || {};

         if (!id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: 'Invalid report id' });
            }

            const report = await db.collection('report').findOne({
               _id: new ObjectId(id)
            });

            if (!report) {
               return res.status(404).json({ success: false, error: "Report doesn't exist" });
            }

            const cluster = await db.collection('cluster').findOne({
               _id: new ObjectId(report.clusterId)
            });

            if (!cluster) {
               return res.status(404).json({ success: false, error: 'Cluster referenced by report not found' });
            }

            const person = await db.collection('person').findOne({
               _id: new ObjectId(report.personId)
            });

            if (!person) {
               return res.status(404).json({ success: false, error: 'Person referenced by report not found' });
            }

            const results = await db.collection('result').find({
               reportId: id
            }).toArray();

            return res.status(200).json({
               success: true,
               body: {
                  id,
                  cluster: cluster.name,
                  clusterId: cluster._id,
                  person: person.name,
                  personId: person._id,
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
         const { cluster, clusterId, person, personId, startTime, endTime, results } = req.body || {};

         if (cluster && clusterId && person && personId && startTime && endTime && results) {
            if (!ObjectId.isValid(clusterId)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            if (!ObjectId.isValid(personId)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
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
               console.log(r);
               insertData.push({
                  instructionId: r.instructionId,
                  reportId: reportId,
                  passed: r.passed,
                  note: r.note
               });
            });

            await db.collection('result').insertMany(insertData);

            return res.status(200).json({ success: true });
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

            const reportExists = await db.collection('report').findOne({
               _id: new ObjectId(id)
            });

            if (!reportExists) {
               return res.status(404).json({ success: false, error: "No report exists with that id" });
            }

            
         }

         return res.status(400).json({ success: false, error: "Missing report id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getTodaysReports,
      getReportById,
      addReport,
      deleteReport
   }
}