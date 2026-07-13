const { ObjectId } = require('mongodb');
const { handleStateChange } = require('../../../schedule/scheduler');

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
         const { id: rawPersonId } = req.params || {};
         const { teamId: rawTeamId } = req.body || {};

         // Check persons id
         if (rawPersonId === undefined || rawPersonId === null) {
            return res.status(400).json({ success: false, error: "Missing person's ID" });
         }

         if (typeof rawPersonId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The persons ID provided is not a string' });
         }

         const personId = rawPersonId.trim();

         if (!personId) {
            return res
               .status(400)
               .json({ success: false, error: "The person's ID provided is empty" });
         }

         if (!ObjectId.isValid(personId)) {
            return res.status(400).json({ success: false, error: 'Invalid person ID provided' });
         }

         // Check team id
         if (rawTeamId === undefined || rawTeamId === null) {
            return res.status(400).json({ success: false, error: "Missing team's ID" });
         }

         if (typeof rawTeamId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team ID provided is not a string' });
         }

         const teamId = rawTeamId.trim();

         if (!teamId) {
            return res
               .status(400)
               .json({ success: false, error: "The team's ID provided is empty" });
         }

         if (!ObjectId.isValid(teamId)) {
            return res.status(400).json({ success: false, error: 'Invalid team ID provided' });
         }

         //  Check if the person exists
         const person = await db.collection('person').findOne({
            _id: new ObjectId(personId)
         });

         if (!person) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         // Check if team won't be left with less than one person
         if (person.teamId) {
            const cluster_count = await db.collection('person').countDocuments({
               teamId: person.teamId
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
            _id: new ObjectId(teamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         // Update the person in the database
         db.collection('person').updateOne(
            { _id: new ObjectId(personId) },
            { $set: { teamId: teamId } }
         );

         await handleStateChange(db);

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
