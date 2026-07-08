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
            return res.status(400).json({ success: false, error: 'Missing team ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         const pool = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!pool) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         // Get the teamPool
         const teamPools = await db.collection('teampool').find({ teamId: sanitizedId }).toArray();

         if (teamPools.length === 0) {
            return res.status(404).json({ success: false, error: 'Team does not have any pools' });
         }

         // Fetch all pool documents
         const allPools = await db
            .collection('pool')
            .find({ _id: { $in: teamPools.map((tp) => new ObjectId(tp.poolId)) } })
            .toArray();

         return res.json({
            success: true,
            body: allPools.map(({ _id, ...pool }) => ({
               id: _id,
               ...pool
            }))
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
