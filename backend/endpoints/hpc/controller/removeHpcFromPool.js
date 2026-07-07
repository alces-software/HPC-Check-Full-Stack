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
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (!poolId) {
            return res.status(400).json({ success: false, error: 'Missing pool id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         const sanitizedPoolId = String(poolId).trim();

         if (sanitizedPoolId.length === 0) {
            return res.status(400).json({ success: false, error: 'The pool id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         if (!ObjectId.isValid(sanitizedPoolId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool id provided' });
         }

         // Get the cluster
         const results = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedId),
         });

         if (!results) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         const poolResults = await db.collection('pool').findOne({
            _id: new ObjectId(sanitizedPoolId),
         });

         if (!poolResults) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         if (!results.poolId === sanitizedPoolId) {
            return res.status(400).json({ success: false, error: 'Cluster not assigned to pool' });
         }

         db.collection('cluster').updateOne(
            { _id: new ObjectId(sanitizedId) },
            {
               $unset: {
                  poolId: '',
               },
            },
         );

         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               name: results.name,
            },
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
