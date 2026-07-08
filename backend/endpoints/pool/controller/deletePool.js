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
         const rawPoolId = req.params?.id || req.body?.id || req.query?.id;

         // Check pool id
         if (rawPoolId === undefined || rawPoolId === null) {
            return res.status(400).json({ success: false, error: 'Missing pool ID' });
         }

         if (typeof rawPoolId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The pool ID provided is not a string' });
         }

         const poolId = rawPoolId.trim();

         if (!ObjectId.isValid(poolId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool ID provided' });
         }

         // Check if pool exits
         const person = await db.collection('pool').findOne({
            _id: new ObjectId(poolId)
         });

         if (!person) {
            return res.status(409).json({
               success: false,
               error: "Pool doesn't exist"
            });
         }

         // Check if pool has clusters
         const hasClusters = await db.collection('cluster').findOne({ poolId });

         if (hasClusters) {
            return res
               .status(409)
               .json({ success: false, error: 'This pool has clusters assigned to it' });
         }

         // Check if pool is assigned to a team
         const isAssigned = await db.collection('teampool').findOne({ poolId });

         if (isAssigned) {
            return res
               .status(409)
               .json({ success: false, error: 'This pool is assigned to a team' });
         }

         // Delete the pool from the database
         await db.collection('pool').deleteOne({
            _id: new ObjectId(poolId)
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
