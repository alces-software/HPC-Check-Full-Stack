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
         const { id: rawInstructionId } = req.params || {};

         // check instruction id
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

         // Check if instruction exists
         const instructionExists = await db.collection('instruction').findOne({
            _id: new ObjectId(instructionId)
         });

         if (!instructionExists) {
            return res.status(409).json({ success: false, error: "Instruction does't exist" });
         }

         // Get methods
         const response = await db
            .collection('method')
            .find({ instructionId })
            .toArray()
            .then((res) =>
               res.map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest
               }))
            );

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
