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
   async function addHpc(req, res) {
      try {
         const { name } = req.body || {};

         if (name) {
            const existingPerson = await db.collection('cluster').findOne({
               name: name
            });

            if (existingPerson) {
               return res.status(409).json({ success: false, error: 'HPC already exits' });
            }

            await db.collection('cluster').insertOne({
               name: name
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing hpc name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllHpc(req, res) {
      try {
         const response = await db.collection('cluster').find({}).toArray().then(results => {
            return results.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const results = await db.collection('cluster').findOne({
               _id: new ObjectId(id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: id,
                  name: results.name
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcByName(req, res) {
      try {
         const { name } = req.params || {};

         if (name) {
            const results = await db.collection('cluster').findOne({
               name: { $regex: `^${name}$`, $options: "i" }
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "HPC doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: results._id.toString(),
                  name: results.name
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing hpc name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteHpc(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const existingPerson = await db.collection('cluster').findOne({
               _id: new ObjectId(id)
            });

            if (!existingPerson) {
               return res.status(409).json({
                  success: false, error: 'HPC doesn\'t exists'
               });
            }

            await db.collection('cluster').deleteOne({
               _id: new ObjectId(id)
            });

            const reports = await db.collection('report').find({
               clusterId: id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            const reportIds = reports.map(report => {
               id: report.id
            });

            reports.forEach(async report => {
               await db.collection('result').deleteMany({
                  reportId: report.id
               });
            });

            await db.collection('report').deleteMany(reportIds);

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing hpc id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   return {
      addHpc,
      getAllHpc,
      getHpcById,
      getHpcByName,
      deleteHpc
   };
}