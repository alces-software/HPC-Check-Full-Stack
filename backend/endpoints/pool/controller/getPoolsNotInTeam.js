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
         const { id: rawTeamId } = req.params || {};

         // Check team id
         if (rawTeamId === undefined || rawTeamId === null) {
            return res.status(400).json({ success: false, error: 'Missing team ID' });
         }

         if (typeof rawTeamId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const teamId = rawTeamId.trim();

         if (!teamId) {
            return res.status(400).json({ success: false, error: 'The team ID provided is empty' });
         }

         if (!ObjectId.isValid(teamId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         // Get the teamPool
         const teamPools = await db.collection('teampool').find({ teamId }).toArray();

         if (teamPools.length === 0) {
            return res.status(404).json({ success: false, error: 'Team does not have any pools' });
         }

         // Get all pool IDs
         const poolIds = teamPools.map((tp) => new ObjectId(tp.poolId));

         // Fetch all pool documents
         const allPools = await db
            .collection('pool')
            .find({ _id: { $nin: poolIds } })
            .toArray();

         return res.json({
            success: true,
            body: allPools.map(({ _id, ...rest }) => ({
               id: _id,
               ...rest
            }))
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
