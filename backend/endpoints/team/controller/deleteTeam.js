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

         // Check if team exists
         const existingTeam = await db.collection('team').findOne({
            _id: new ObjectId(teamId)
         });

         if (!existingTeam) {
            return res.status(409).json({ success: false, error: "Team doesn't exists" });
         }

         // Check if people are linked to the team
         const people = await db.collection('person').find({ teamId }).toArray();

         if (people.length > 0) {
            return res.status(409).json({ success: false, error: 'This team has people' });
         }

         // Check if clusters are linked to the team
         const clusters = await db.collection('teampool').find({ teamId }).toArray();

         if (clusters.length > 0) {
            return res.status(409).json({ success: false, error: 'This team has pools' });
         }

         // Delete the team
         await db.collection('team').deleteOne({
            _id: new ObjectId(teamId)
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
