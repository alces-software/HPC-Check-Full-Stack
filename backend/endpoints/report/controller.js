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

         const people = await db.collection('person').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const cluster = await db.collection('cluster').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const response = await db.collection('report').find({
            startDate: {
               $gte: startOfDay.getTime(),
               $lte: endOfDay.getTime()
            }
         }).toArray().then(result => {
            return result.map(({ _id, ...rest }) => ({
               ...rest,
               id: _id.toString(),
               person: people.find(p => p.id === rest.personId)?.name,
               cluster: cluster.find(c => c.id === rest.clusterId)?.name
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

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const people = await db.collection('person').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const cluster = await db.collection('cluster').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const response = await db.collection('report').find({
               clusterId: id,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
               }
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString(),
                  person: people.find(p => p.id === rest.personId)?.name,
                  cluster: cluster.find(c => c.id === rest.clusterId)?.name
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
   async function getReportWeek(req, res) {
      try {
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 20;
         const skip = (page - 1) * limit;

         const people = await db.collection('person').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const cluster = await db.collection('cluster').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const d = new Date();
         const day = d.getDay();

         const diffToMonday = day === 0 ? -6 : 1 - day;

         const start = new Date(d);
         start.setDate(d.getDate() + diffToMonday);
         start.setUTCHours(0, 0, 0, 0);

         const end = new Date(start);
         end.setDate(start.getDate() + 6);
         end.setUTCHours(23, 59, 59, 999);

         const query = {
            startDate: {
               $gte: start.getTime(),
               $lte: end.getTime()
            }
         };

         const [totalCount, results] = await Promise.all([
            db.collection('report').countDocuments(query),
            db.collection('report')
               .find(query)
               .sort({ startDate: -1 })
               .skip(skip)
               .limit(limit)
               .toArray()
         ]);

         const totalPages = Math.ceil(totalCount / limit);

         return res.status(200).json({
            success: true,
            body: results.map(({ _id, ...rest }) => ({
               ...rest,
               id: _id.toString(),
               person: people.find(p => p.id === rest.personId)?.name,
               cluster: cluster.find(c => c.id === rest.clusterId)?.name
            })),
            pagination: {
               totalCount,
               page,
               limit,
               totalPages,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         });
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
         const id = req.params.id || null;

         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 20;
         const skip = (page - 1) * limit;

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing cluster id" });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const people = await db.collection('person').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const cluster = await db.collection('cluster').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const query = { clusterId: id };

         // run count + data in parallel
         const [total, data] = await Promise.all([
            db.collection('report').countDocuments(query),
            db.collection('report')
               .find(query)
               .sort({ startDate: -1 })
               .skip(skip)
               .limit(limit)
               .toArray()
         ]);

         const totalPages = Math.ceil(total / limit);

         return res.status(200).json({
            success: true,
            id,
            body: data.map(({ _id, ...rest }) => ({
               ...rest,
               id: _id.toString(),
               person: people.find(p => p.id === rest.personId)?.name,
               cluster: cluster.find(c => c.id == rest.clusterId)?.name
            })),
            pagination: {
               total,
               page,
               limit,
               totalPages,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         });
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

            const people = await db.collection('person').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const cluster = await db.collection('cluster').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            return res.status(200).json({
               success: true,
               body: {
                  id,
                  clusterId: report.clusterId,
                  cluster: cluster.find(c => c.id === report.clusterId)?.name,
                  personId: report.personId,
                  person: people.find(p => p.id === report.personId)?.name,
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
               endDate: Long.fromNumber(endTime),
               passed: results.every(r => r.passed)
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

   return {
      getTodaysReports,
      getTodaysReportByCluster,
      getReportWeek,
      getReportByCluster,
      getReportById,
      addReport
   }
}