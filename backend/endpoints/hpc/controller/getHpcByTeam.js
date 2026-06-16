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
   async function getHpcByTeam(req, res) {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         const results = await db.collection('cluster').find({
            teamId: id
         });

         const data = await results.toArray().then(results => results.map((result) => {
            result._id = result._id.toString();
            return result;
         }))

         return res.status(200).json({
            success: true, body: data
         });

      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return getHpcByTeam;
};