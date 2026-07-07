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
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         const poolResults = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId),
         });

         if (!poolResults) {
            return res.status(404).json({ success: false, error: "team doesn't exist" });
         }

         // Get the teamPool
         const teamPools = await db.collection('teampool').find({ teamId: sanitizedId }).toArray();

         if (teamPools.length === 0) {
            return res.status(404).json({ success: false, error: 'Team does not have any pools' });
         }

         // Get all pool IDs
         const poolIds = teamPools.map((tp) => new ObjectId(tp.poolId));

         // Fetch all pool documents
         const pools = await db
            .collection('pool')
            .find({ _id: { $in: poolIds } })
            .toArray();

         const response = pools.map(({ _id, ...pool }) => ({
            id: _id,
            ...pool,
         }));

         return res.json({
            success: true,
            body: response,
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
