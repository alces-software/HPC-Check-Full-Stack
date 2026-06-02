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
         if (req.body.name) {
            const existingPerson = await db.collection('cluster').findOne({
               name: req.body.name
            });

            if (existingPerson) {
               return res.status(409).json({ success: false, error: 'HPC already exits' });
            }

            db.collection('cluster').insertOne({
               name: req.body.name
            });
         } else {
            return res.status(400).json({ success: false, error: 'Missing hpc name' });
         }

         res.status(200).json({ success: true });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllHpc(req, res) {
      try {
         const response = (await db.collection('cluster').find({}).toArray()).map(data => ({
            id: data._id.toString(),
            name: data.name
         }));

         res.status(200).json({ success: true, body: response });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcById(req, res) {
      try {
         if (req.params.id) {
            const results = await db.collection('cluster').findOne({
               _id: new ObjectId(req.params.id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "HPC doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: req.params.id,
                  name: results.name
               }
            });
         }

         res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpcByName(req, res) {
      try {
         if (req.params.name) {
            const results = await db.collection('cluster').findOne({
               name: { $regex: `^${req.params.name}$`, $options: "i" }
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

         res.status(400).json({ success: false, error: 'Missing hpc name' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteHpc(req, res) {
      try {
         if (req.body.id) {
            const existingPerson = await db.collection('cluster').findOne({
               _id: new ObjectId(req.body.id)
            });

            if (!existingPerson) {
               return res.status(409).json({
                  success: false, error: 'HPC doesn\'t exists'
               });
            }

            db.collection('cluster').deleteOne({
               _id: new ObjectId(req.body.id)
            });
         } else {
            return res.status(400).json({ success: false, error: 'Missing hpc id' });
         }

         res.status(200).json({ success: true });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
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