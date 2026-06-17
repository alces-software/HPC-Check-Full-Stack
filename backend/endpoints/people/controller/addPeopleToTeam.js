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
         const { teamId } = req.body || {}

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing person\'s id' });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: 'Missing team\'s id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid person id provided" });
         }

         const person = await db.collection('person')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!person) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         const teamExists = await db.collection('team')
            .findOne({
               _id: new ObjectId(teamId)
            });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         db.collection('person')
            .updateOne(
               { _id: new ObjectId(id) },
               { $set: { teamId: teamId } }
            );

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};