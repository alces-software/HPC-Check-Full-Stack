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

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing persons id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid person id provided" });
         }

         const existingPerson = await db.collection('person')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!existingPerson) {
            return res.status(409).json({
               success: false, error: 'Person doesn\'t exists'
            });
         }

         const hasReports = await db.collection('report')
            .find({
               personId: id
            })
            .toArray();

         if (hasReports.length > 0) {
            return res.status(409).json({ success: false, error: "This person has reports" });
         }

         await db.collection('person')
            .deleteOne({
               _id: new ObjectId(id)
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};