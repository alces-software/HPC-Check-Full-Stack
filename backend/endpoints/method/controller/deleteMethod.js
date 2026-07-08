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
         const { id: rawMethodId } = req.params;

         // Check method id
         if (rawMethodId === undefined || rawMethodId === null) {
            return res.status(400).json({ success: false, error: 'Missing method ID' });
         }

         if (typeof rawMethodId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The method ID provided is not a string' });
         }

         const methodId = rawMethodId.trim();

         if (!methodId) {
            return res
               .status(400)
               .json({ success: false, error: 'The method ID provided is empty' });
         }

         if (!ObjectId.isValid(methodId)) {
            return res
               .status(400)
               .json({ success: false, error: 'The method ID provided is invalid' });
         }

         // Delete from the database
         await db.collection('method').findOneAndDelete({
            _id: new ObjectId(methodId)
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
