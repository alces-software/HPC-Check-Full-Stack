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
            return res.status(400).json({ success: false, error: 'Missing pool ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The pool ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool ID provided' });
         }

         const pool = await db.collection('pool').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!pool) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         // Get the teamPool
         const teamPool = await db.collection('teampool').find({ poolId: sanitizedId }).toArray();

         if (teamPool.length === 0) {
            return res.status(404).json({ success: false, error: 'Pool does not have any teams' });
         }

         // Return the team information
         return res.status(200).json({
            success: true,
            body: teamPool.map((result) => ({
               poolId: sanitizedId,
               teamId: result.teamId
            }))
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
