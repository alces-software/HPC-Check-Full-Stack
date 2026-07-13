const { ObjectId } = require('mongodb');
const { handleStateChange } = require('../../../schedule/scheduler');

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
         const { teamId: rawTeamId } = req.body || {};

         // Check pool id
         if (rawPoolId === undefined || rawPoolId === null) {
            return res.status(400).json({ success: false, error: 'missing pool ID' });
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

         // Check team id
         if (rawTeamId === undefined || rawTeamId === null) {
            return res.status(400).json({ success: false, error: 'missing team ID' });
         }

         if (typeof rawTeamId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const teamId = rawTeamId.trim();

         if (teamId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team ID provided is empty' });
         }

         if (!ObjectId.isValid(teamId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         // Get pool
         const pool = await db.collection('pool').findOne({ _id: new ObjectId(poolId) });

         if (!pool) {
            return res.status(404).json({ success: false, error: 'Pool with that ID not found' });
         }

         // Get team
         const team = await db.collection('team').findOne({ _id: new ObjectId(teamId) });

         if (!team) {
            return res.status(404).json({ success: false, error: 'Team with that ID not found' });
         }

         // Check if pool is assigned to team
         const teamPool = await db.collection('teampool').findOne({ teamId, poolId });

         if (!teamPool) {
            return res
               .status(400)
               .json({ success: false, error: 'Pool is not assigned to this team' });
         }

         // Delete from database
         await db.collection('teampool').deleteOne({ teamId, poolId });

         await handleStateChange(db);

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
