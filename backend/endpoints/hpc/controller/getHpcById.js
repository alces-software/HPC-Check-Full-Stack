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
   async function getHpcById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const results = await db.collection('cluster').findOne({
               _id: new ObjectId(id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: id,
                  name: results.name,
                  teamId: results.teamId
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return getHpcById;
};