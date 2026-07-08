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
         const { id: rawInstructionId, content: rawContent } = req.body || {};

         // Check instruction id
         if (rawInstructionId === undefined || rawInstructionId === null) {
            return res.status(400).json({ success: false, error: 'Missing instruction ID' });
         }

         if (typeof rawInstructionId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The instruction ID provided is not a string' });
         }

         const instructionId = rawInstructionId.trim();

         if (!instructionId) {
            return res
               .status(400)
               .json({ success: false, error: 'The instruction ID provided is empty' });
         }

         if (!ObjectId.isValid(instructionId)) {
            return res
               .status(400)
               .json({ success: false, error: 'Invalid instruction ID provided' });
         }

         // Check content
         if (rawContent === undefined || rawContent === null) {
            return res.status(400).json({ success: false, error: 'Missing method content' });
         }

         if (typeof rawContent !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The content provided is not a string' });
         }

         const content = rawContent.trim();

         if (!content) {
            return res.status(400).json({ success: false, error: 'The content provided is empty' });
         }

         // Check if instruction exists
         const instruction = await db.collection('instruction').findOne({
            _id: new ObjectId(instructionId)
         });

         if (!instruction) {
            return res
               .status(404)
               .json({ success: false, error: "An instruction with that id doesn't exist" });
         }

         // Add to database
         await db.collection('method').insertOne({ instructionId, content });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
