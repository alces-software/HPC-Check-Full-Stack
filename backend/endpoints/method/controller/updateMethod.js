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
         const { id: rawMethodId, content: rawContent } = req.body;

         // Check method id
         if (rawMethodId === undefined || rawMethodId === null) {
            return res.status(400).json({ success: false, error: 'Missing method ID' });
         }

         if (typeof rawMethodId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The method id provided is not a string' });
         }

         const methodId = rawMethodId.trim();

         if (!methodId) {
            return res
               .status(400)
               .json({ success: false, error: 'The method id provided is empty' });
         }

         if (!ObjectId.isValid(methodId)) {
            return res.status(400).json({ success: false, error: 'Invalid method id provided' });
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

         // Make sure the method is in the database
         const method = await db.collection('method').findOne({
            _id: new ObjectId(methodId)
         });

         if (!method) {
            return res.status(404).json({ success: false, error: 'No method found with that id' });
         }

         // Update the method in the database
         await db
            .collection('method')
            .updateOne({ _id: new ObjectId(methodId) }, { $set: { content } });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
