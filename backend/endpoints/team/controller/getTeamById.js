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
         if (typeof id !== 'string') {
            return res.status(400).json({ success: false, error: "The team id provided is not a string" });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing teams id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         // Get the team
         const results = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!results) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         // Return the team information
         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               name: results.name,
               clusters_per_day: results.clusters_per_day,
               start_window: results.start_window,
               end_window: results.end_window
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
