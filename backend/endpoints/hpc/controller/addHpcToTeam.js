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
         const { teamId } = req.body || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster\'s id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: 'Missing team\'s id' });
         }

         const sanitizedTeamId = String(teamId).trim();

         if (sanitizedTeamId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid team id provided" });
         }

         const person = await db.collection('cluster')
            .findOne({
               _id: new ObjectId(sanitizedId)
            });

         if (!person) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         const teamExists = await db.collection('team')
            .findOne({
               _id: new ObjectId(sanitizedTeamId)
            });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         await db.collection('cluster')
            .updateOne(
               { _id: new ObjectId(sanitizedId) },
               { $set: { teamId: sanitizedTeamId } }
            );

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};