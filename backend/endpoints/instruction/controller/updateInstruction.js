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
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing instruction id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length == 0) {
            return res.status(400).json({ success: false, error: 'The id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'The id provided is invalid' });
         }

         // Check updates
         const updates = Object.fromEntries(
            Object.entries(rest)
               .filter(([_, v]) => v != null)
               .map(([k, v]) => [
                  k,
                  typeof v === "string" ? v.trim() : v
               ])
         );

         if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
         }

         // Updates values in the
         await db.collection('instruction')
            .updateOne(
               { _id: new ObjectId(sanitizedId) },
               { $set: updates }
            );

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};