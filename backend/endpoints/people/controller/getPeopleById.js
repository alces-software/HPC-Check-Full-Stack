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
            return res.status(400).json({ success: false, error: 'Missing persons id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The persons id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid person id provided' });
         }

         // Get the person from the database
         const results = await db.collection('person').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!results) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         return res.status(200).json({
            success: true,
            body: {
               id: sanitizedId,
               name: results.name,
               teamId: results.teamId
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
