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
   return async (req, res) => {
      try {
         const { id } = req.params || {};

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster ID provided is not a string' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster ID provided' });
         }

         // Get the cluster from the database
         const cluster = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!cluster) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         if (!cluster.poolId) {
            return res.status(404).json({ success: false, error: 'Cluster not assigned to pool' });
         }

         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               pool: cluster.poolId
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
