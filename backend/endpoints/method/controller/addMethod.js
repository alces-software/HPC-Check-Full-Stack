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

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The instruction id provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing instruction id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The instruction id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res
               .status(400)
               .json({ success: false, error: 'Invalid instruction id provided' });
         }

         // Check content
         if (typeof content !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The content provided is not a string' });
         }

         if (!content) {
            return res.status(400).json({ success: false, error: 'Missing method content' });
         }

         const sanitizedContent = String(content).trim();

         if (sanitizedContent.length == 0) {
            return res.status(400).json({ success: false, error: 'The content provided is empty' });
         }

         // Check if instruction exists
         const instructionExists = await db.collection('instruction').findOne({
            _id: new ObjectId(sanitizedId),
         });

         if (!instructionExists) {
            return res
               .status(404)
               .json({ success: false, error: "An instruction with that id doesn't exist" });
         }

         // Add to database
         await db.collection('method').insertOne({
            instructionId: sanitizedId,
            content: sanitizedContent,
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
