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
         const { id: rawPersonId } = req.params;

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

         if (!ObjectId.isValid(personId)) {
            return res.status(400).json({ success: false, error: 'Invalid person ID provided' });
         }

         // Check if person exists
         const person = await db.collection('person').findOne({
            _id: new ObjectId(personId)
         });

         if (!person) {
            return res.status(409).json({
               success: false,
               error: "Person doesn't exists"
            });
         }

         // Check if person has reports
         const hasReports = await db.collection('report').findOne({ personId });

         if (hasReports) {
            return res.status(409).json({ success: false, error: 'This person has reports' });
         }

         // Delete the person from the database
         await db.collection('person').deleteOne({
            _id: new ObjectId(personId)
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
