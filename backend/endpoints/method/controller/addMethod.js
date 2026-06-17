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
         const { id, content } = req.body || {};

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing instruction id" });
         }

         if (!content) {
            return res.status(400).json({ success: false, error: "Missing method content" });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid instruction id provided" });
         }

         const instructionExists = await db.collection('instruction')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!instructionExists) {
            return res.status(404).json({ success: false, error: "An instruction with that id doesn't exist" });
         }

         const sanitizedContent = String(content).trim();

         if (sanitizedContent.length == 0) {
            return res.status(400).json({ success: false, error: "The content provided is empty" });
         }

         await db.collection('method')
            .insertOne({
               instructionId: id,
               content: sanitizedContent
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};