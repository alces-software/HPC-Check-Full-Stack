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

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const data = await db.collection('cluster')
            .find({
               teamId: id
            })
            .toArray()
            .then(results => results
               .map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest,
               }))
            );

         return res.status(200).json({ success: true, body: data });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};