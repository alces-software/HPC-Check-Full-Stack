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
         const { id: rawClusterId } = req.params || {};
         const { poolId: rawPoolId } = req.body || {};

         // Check id
         if (rawClusterId === undefined || rawClusterId === null) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (typeof rawClusterId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is not a string' });
         }

         const clusterId = rawClusterId.trim();

         if (!clusterId) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(clusterId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         // Check pool id
         if (rawPoolId === undefined || rawPoolId === null) {
            return res.status(400).json({ success: false, error: 'Missing pool id' });
         }

         if (typeof rawPoolId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The pool id provided is not a string' });
         }

         const poolId = rawPoolId.trim();

         if (!poolId) {
            return res.status(400).json({ success: false, error: 'The pool id provided is empty' });
         }

         if (!ObjectId.isValid(poolId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool id provided' });
         }

         // Get the cluster
         const cluster = await db.collection('cluster').findOne({
            _id: new ObjectId(clusterId)
         });

         if (!cluster) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         // Get the pool
         const pool = await db.collection('pool').findOne({
            _id: new ObjectId(poolId)
         });

         if (!pool) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         if (!cluster.poolId === poolId) {
            return res.status(400).json({ success: false, error: 'Cluster not assigned to pool' });
         }

         // Update database
         db.collection('cluster').updateOne(
            { _id: new ObjectId(clusterId) },
            {
               $unset: {
                  poolId: ''
               }
            }
         );

         return res.status(200).json({
            success: true,
            body: {
               id: clusterId,
               name: cluster.name
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
