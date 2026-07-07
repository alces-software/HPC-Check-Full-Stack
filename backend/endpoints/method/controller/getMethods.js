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

         // check id
         if (typeof id !== 'string') {
            return res.status(400).json({ success: false, error: "The instruction id provided is not a string" });
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

         // Check if instruction exists
         const instructionExists = await db.collection('instruction').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!instructionExists) {
            return res.status(409).json({ success: false, error: "Instruction does't exist" });
         }

         // Get methods
         const response = await db
            .collection('method')
            .find({
               instructionId: sanitizedId
            })
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
