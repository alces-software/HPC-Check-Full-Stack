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

         if (sanitizedId.length == 0) {
            return res.status(400).json({ success: false, error: 'The id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'The id provided is invalid' });
         }

         // Delete instruction
         await db.collection('instruction').deleteOne({
            _id: new ObjectId(sanitizedId)
         });

         // Delete all the methods associated with the instruction
         await db.collection('method').deleteMany({
            instructionId: sanitizedId
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
