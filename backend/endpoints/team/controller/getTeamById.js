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
            return res.status(400).json({ success: false, error: 'Missing teams ID' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team ID provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         // Get the team
         const response = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!response) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         response.id = response._id.toString();
         delete response._id;

         // Return the team information
         return res.status(200).json({
            success: true,
            body: response
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
