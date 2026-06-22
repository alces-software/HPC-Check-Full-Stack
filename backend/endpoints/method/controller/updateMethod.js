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
         const { id, content } = req.body;

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing method id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The method id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid method id provided' });
         }

         // Check content
         if (!content) {
            return res.status(400).json({ success: false, error: 'Missing method content' });
         }

         const sanitizedContent = String(content).trim();

         if (sanitizedContent.length == 0) {
            return res.status(400).json({ success: false, error: 'The content provided is empty' });
         }

         // Make sure the method is in the database
         const method = await db.collection('method').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!method) {
            return res.status(404).json({ success: false, error: 'No method found with that id' });
         }

         // Update the method in the database
         await db
            .collection('method')
            .updateOne({ _id: new ObjectId(sanitizedId) }, { $set: { content: sanitizedContent } });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
