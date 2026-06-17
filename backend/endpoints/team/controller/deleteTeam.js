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

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing team\'s id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid team id provided" });
         }

         const existingPerson = await db.collection('team')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!existingPerson) {
            return res.status(409).json({ success: false, error: 'Team doesn\'t exists' });
         }

         const hasPeople = await db.collection('person')
            .find({
               teamId: id
            })
            .toArray();

         if (hasPeople.length > 0) {
            return res.status(409).json({ success: false, error: "This team has people" });
         }

         const hasClusters = await db.collection('cluster')
            .find({
               teamId: id
            })
            .toArray();

         if (hasClusters.length > 0) {
            return res.status(409).json({ success: false, error: "This team has clusters" });
         }

         await db.collection('team')
            .deleteOne({
               _id: new ObjectId(id)
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};