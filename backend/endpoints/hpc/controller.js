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
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const existingPerson = await db.collection('cluster').findOne({
               name: sanitizedName
            });

            if (existingPerson) {
               return res.status(409).json({ success: false, error: 'HPC already exits' });
            }

            await db.collection('cluster').insertOne({
               name: sanitizedName
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
               name: data.name,
               teamId: data.teamId
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
                  name: results.name,
                  teamId: results.teamId
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
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const results = await db.collection('cluster').findOne({
               name: { $regex: `^${sanitizedName}$`, $options: "i" }
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "HPC doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: results._id.toString(),
                  name: results.name,
                  teamId: results.teamId
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

            const existingCluster = await db.collection('cluster').findOneAndDelete({
               _id: new ObjectId(id)
            });

            if (!existingCluster) {
               return res.status(409).json({
                  success: false, error: 'HPC doesn\'t exists'
               });
            }

            const reports = await db.collection('report').find({
               clusterId: id
            }).toArray().then(result => {
               return result.map(({ _id }) => ({
                  _id: _id
               }));
            });

            if (reports.length == 0) {
               return res.status(200).json({ success: true });
            }

            reports.forEach(async report => {
               await db.collection('result').deleteMany({
                  reportId: report._id
               });
            });

            await db.collection('report').deleteMany({ _id: { $in: reports.map(r => r._id) } });

            const instructions = await db.collection('instruction').find({
               clusterId: new ObjectId(id)
            }).toArray().then(result => {
               return result.map(({ _id }) => ({
                  _id: _id
               }));
            });

            instructions.forEach(async instruction => {
               await db.collection('method').deleteMany({
                  instructionId: instruction._id
               });
            });

            await db.collection('instruction').deleteMany({ _id: { $in: instructions.map(i => i._id) } });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing hpc id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcByTeam(req, res) {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const results = await db.collection('cluster').find({
            teamId: id
         });

         const data = await results.toArray().then(results => results.map((result) => {
            result._id = result._id.toString();
            return result;
         }))

         return res.status(200).json({
            success: true, body: data
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
   async function assignToTeam(req, res) {
      try {
         const { id } = req.params || {};
         const { teamId } = req.body || {}
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster\'s id' });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: 'Missing team\'s id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const person = await db.collection('cluster').findOne({
            _id: new ObjectId(id)
         });

         if (!person) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(teamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         db.collection('cluster').updateOne(
            { _id: new ObjectId(id) },
            { $set: {teamId: teamId} }
         );

         return res.status(200).json({ success: true });

      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcNotInTeam(req, res) {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid team id provided" });
         }

         const results = await db.collection('cluster').find({
            teamId: {$ne: id}
         });

         const data = await results.toArray().then(results => results.map((result) => {
            result._id = result._id.toString();
            return result;
         }))

         return res.status(200).json({
            success: true, body: data
         });

      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      addHpc,
      getAllHpc,
      getHpcById,
      getHpcByName,
      getHpcByTeam,
      getHpcNotInTeam,
      deleteHpc,
      assignToTeam
   };
}