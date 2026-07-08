const { templateIt } = require('../../../services/templater/templateIt');

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
         const { name } = req.body || {};

         // Check name
         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing cluster name' });
         }

         if (typeof name !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster name provided is not a string' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length == 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster name provided is empty' });
         }

         // Check if hpc already exists
         const existing = await db.collection('cluster').findOne({
            name: {
               $regex: `^${sanitizedName}$`,
               $options: 'i'
            }
         });

         if (existing) {
            return res.status(409).json({ success: false, error: 'Cluster already exits' });
         }

         // Add it to the database
         const clusterId = await db
            .collection('cluster')
            .insertOne({
               name: sanitizedName
            })
            .then((res) => res.insertedId.toString());

         // Populate the database with generic instructions and methods for the cluster
         templateIt(clusterId, db);

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
