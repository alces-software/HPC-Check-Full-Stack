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
         const { id } = req.body || {};

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: "Missing team's id" });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         // Check if team exists
         const existingTeam = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId),
         });

         if (!existingTeam) {
            return res.status(409).json({ success: false, error: "Team doesn't exists" });
         }

         // Check if people are linked to the team
         const hasPeople = await db
            .collection('person')
            .find({
               teamId: sanitizedId,
            })
            .toArray();

         if (hasPeople.length > 0) {
            return res.status(409).json({ success: false, error: 'This team has people' });
         }

         // Check if clusters are linked to the team
         const hasClusters = await db
            .collection('cluster')
            .find({
               teamId: sanitizedId,
            })
            .toArray();

         if (hasClusters.length > 0) {
            return res.status(409).json({ success: false, error: 'This team has clusters' });
         }

         // Delete the team
         await db.collection('team').deleteOne({
            _id: new ObjectId(sanitizedId),
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
