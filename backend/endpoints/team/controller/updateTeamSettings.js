const { ObjectId } = require('mongodb');
const { handleStateChange } = require('../../../schedule/scheduler');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = db => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   return async (req, res) => {
      try {
         const { id: rawTeamId, ...rest } = req.body || {};

         // Check id
         if (rawTeamId === undefined || rawTeamId === null) {
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         if (typeof rawTeamId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided is not a string' });
         }

         const teamId = rawTeamId.trim();

         if (!teamId) {
            return res.json(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(teamId)) {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided was invalid' });
         }

         // Check team exists
         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(teamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: 'No team exists with that id' });
         }

         // Check updates
         const updates = Object.fromEntries(
            Object.entries(rest)
               .filter(([k, v]) => v != null && k != '_id')
               .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
         );

         if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
         }

         // Updates values in the database
         await db.collection('team').updateOne({ _id: new ObjectId(teamId) }, { $set: updates });

         await handleStateChange(db);

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
