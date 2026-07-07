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

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         // Get the cluster
         const data = await db
            .collection('cluster')
            .find({
               teamId: { $ne: sanitizedId }
            })
            .toArray()
            .then((res) =>
               res.map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest
               }))
            );

         return res.status(200).json({ success: true, body: data });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
