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
         const { id: rawInstructionId } = req.params;

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
            return res.status(400).json({ success: false, error: 'The ID provided is empty' });
         }

         if (!ObjectId.isValid(instructionId)) {
            return res.status(400).json({ success: false, error: 'The ID provided is invalid' });
         }

         // Delete instruction
         await db.collection('instruction').deleteOne({
            _id: new ObjectId(instructionId)
         });

         // Delete all the methods associated with the instruction
         await db.collection('method').deleteMany({ instructionId });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
