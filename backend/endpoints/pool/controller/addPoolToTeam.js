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
         const { teamId } = req.body || {};
         const { id } = req.params || {};

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'missing pool ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The pool ID provided is not a string' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The pool ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool ID provided' });
         }

         // Check team id
         if (!teamId) {
            return res.status(400).json({ success: false, error: 'missing team ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const sanitizedTeamId = String(teamId).trim();

         if (sanitizedTeamId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedTeamId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         // Get pool
         const pool = await db.collection('pool').findOne({ _id: new ObjectId(sanitizedId) });

         if (!pool) {
            return res.status(404).json({ success: false, error: 'Pool with that ID not found' });
         }

         //  Get team
         const team = await db.collection('team').findOne({ _id: new ObjectId(sanitizedTeamId) });

         if (!team) {
            return res.status(404).json({ success: false, error: 'Team with that ID not found' });
         }

         // Team pool
         const teamPool = await db.collection('teampool').findOne({
            teamId: sanitizedTeamId,
            poolId: sanitizedId
         });

         if (teamPool) {
            return res
               .status(400)
               .json({ success: false, error: 'Pool is already assigned to team' });
         }

         // Add to database
         const result = await db.collection('teampool').insertOne({
            teamId: sanitizedTeamId,
            poolId: sanitizedId
         });

         return res.status(200).json({
            success: true,
            body: {
               newId: result.insertedId
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
