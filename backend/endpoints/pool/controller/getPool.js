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
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing pool id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool id provided' });
         }

         // Get the pool from the database
         const results = await db.collection('pool').findOne({
            _id: new ObjectId(sanitizedId),
         });

         if (!results) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               name: results.name,
            },
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
