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
         const { id: rawMethodId } = req.params || {};

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
            return res.status(400).json({ success: false, error: 'Invalid method ID provided' });
         }

         // Get methods
         const response = await db.collection('method').findOne({
            _id: new ObjectId(methodId)
         });

         if (!response) {
            return res.status(409).json({ success: false, error: "Method does't exist" });
         }

         response.id = methodId;
         delete response._id;

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
