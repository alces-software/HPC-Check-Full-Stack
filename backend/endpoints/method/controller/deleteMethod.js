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
            return res.status(400).json({ success: false, error: "Missing method id" });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "The method is provided is invalid" });
         }

         await db.collection('method')
            .findOneAndDelete({
               _id: new ObjectId(id)
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};