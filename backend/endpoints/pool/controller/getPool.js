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
         const { id: rawPoolId } = req.params || {};

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

         if (!poolId) {
            return res.status(400).json({ success: false, error: 'The pool ID provided is empty' });
         }

         if (!ObjectId.isValid(poolId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool ID provided' });
         }

         // Get the pool from the database
         const pool = await db.collection('pool').findOne({
            _id: new ObjectId(poolId)
         });

         if (!pool) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         pool.id = pool._id.toString();
         delete pool._id;

         return res.status(200).json({ success: true, body: pool });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
