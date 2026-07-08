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
         const { id: rawPersonId } = req.params || {};

         // Check person id
         if (rawPersonId === undefined || rawPersonId === null) {
            return res.status(400).json({ success: false, error: 'Missing persons ID' });
         }

         if (typeof rawPersonId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The persons ID provided is not a string' });
         }

         const personId = rawPersonId.trim();

         if (!personId) {
            return res
               .status(400)
               .json({ success: false, error: 'The persons ID provided is empty' });
         }

         if (!ObjectId.isValid(personId)) {
            return res.status(400).json({ success: false, error: 'Invalid person ID provided' });
         }

         // Get the person from the database
         const response = await db.collection('person').findOne({
            _id: new ObjectId(personId)
         });

         if (!response) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         response.id = personId;
         delete response._id;

         return res.status(200).json({
            success: true,
            body: response
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
