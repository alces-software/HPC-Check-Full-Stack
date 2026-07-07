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
         const { teamId } = req.body || {};

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The persons id provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing person's id" });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: "The person's id provided is empty" });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid person id provided' });
         }

         // Check team id
         if (typeof teamId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team id provided is not a string' });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: "Missing team's id" });
         }

         const sanitizedTeamId = String(teamId).trim();

         if (sanitizedTeamId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: "The team's id provided is empty" });
         }

         if (!ObjectId.isValid(sanitizedTeamId)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         //  Check if the person exists
         const personExists = await db.collection('person').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!personExists) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         // Check if clusters current team wont be left without clusters
         if (personExists.teamId) {
            const cluster_count = await db.collection('cluster').countDocuments({
               teamId: personExists.teamId
            });

            if (cluster_count <= 1) {
               return res.status(422).json({
                  success: false,
                  error: "Can't remove person as the team would be left without a person"
               });
            }
         }

         // Check if the team exists
         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedTeamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         // Update the person in the database
         db.collection('person').updateOne(
            { _id: new ObjectId(sanitizedId) },
            { $set: { teamId: sanitizedTeamId } }
         );

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
