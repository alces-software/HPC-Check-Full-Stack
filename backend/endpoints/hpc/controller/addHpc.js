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
         if (typeof name !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The name provided is not a string' });
         }

         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing hpc name' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length == 0) {
            return res.status(400).json({ success: false, error: 'The name provided is empty' });
         }

         // Check if hpc already exists
         const existingHpc = await db.collection('cluster').findOne({
            name: {
               $regex: `^${sanitizedName}$`,
               $options: 'i'
            }
         });

         if (existingHpc) {
            return res.status(409).json({ success: false, error: 'HPC already exits' });
         }

         // Add it to the database
         const clusterId = await db
            .collection('cluster')
            .insertOne({
               name: sanitizedName
            })
            .then((res) => res.insertedId.toString());

         templateIt(clusterId, db);

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
