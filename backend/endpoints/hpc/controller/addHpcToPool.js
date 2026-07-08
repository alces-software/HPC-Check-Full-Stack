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
         const { poolId } = req.body || {};

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster ID provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster ID' });
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

         // Check pool id
         if (typeof poolId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The pool ID provided is not a string' });
         }

         if (!poolId) {
            return res.status(400).json({ success: false, error: 'Missing pool ID' });
         }

         const sanitizedPoolId = String(poolId).trim();

         if (sanitizedPoolId.length === 0) {
            return res.status(400).json({ success: false, error: 'The pool ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedPoolId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool ID provided' });
         }

         // Get the cluster
         const cluster = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!cluster) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         if (cluster.poolId === sanitizedPoolId) {
            return res
               .status(400)
               .json({ success: false, error: 'Cluster already assigned to pool' });
         }

         // Get pool
         const pool = await db.collection('pool').findOne({
            _id: new ObjectId(sanitizedPoolId)
         });

         if (!pool) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         db.collection('cluster').updateOne(
            { _id: new ObjectId(sanitizedId) },
            {
               $set: {
                  poolId: sanitizedPoolId
               }
            }
         );

         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               name: cluster.name,
               poolId: sanitizedPoolId
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
