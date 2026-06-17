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

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing persons id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid person id provided" });
         }

         const results = await db.collection('person')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!results) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         return res.status(200).json({
            success: true, body: {
               id: id,
               name: results.name,
               teamId: results.teamId
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};