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
         const { id, ...rest } = req.body || {};

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.json(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided was invalid' });
         }

         // Check team exists
         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId)
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
         await db
            .collection('team')
            .updateOne({ _id: new ObjectId(sanitizedId) }, { $set: updates });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
