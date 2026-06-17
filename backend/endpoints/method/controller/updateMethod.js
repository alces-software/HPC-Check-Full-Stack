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
         const { id, content } = req.body;

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing method id" });
         }

         if (!content) {
            return res.status(400).json({ success: false, error: "Missing method content" });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid method id provided" });
         }

         const method = await db.collection('method')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!method) {
            return res.status(404).json({ success: false, error: "No method found with that id" });
         }

         const sanitizedContent = String(content).trim();

         if (sanitizedContent.length == 0) {
            return res.status(400).json({ success: false, error: "The content provided is empty" });
         }

         await db.collection('method')
            .updateOne(
               { _id: new ObjectId(id) },
               { $set: { content: sanitizedContent } }
            );

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};