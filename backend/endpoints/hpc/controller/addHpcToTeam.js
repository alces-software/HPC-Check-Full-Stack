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
            return res.status(400).json({ success: false, error: "The cluster id provided is not a string" });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing cluster's id" });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         // Check team id
         if (typeof teamId !== 'string') {
            return res.status(400).json({ success: false, error: "The team id provided is not a string" });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: "Missing team's id" });
         }

         const sanitizedTeamId = String(teamId).trim();

         if (sanitizedTeamId.length === 0) {
            return res.status(400).json({ success: false, error: 'The team id provided is empty' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid team id provided' });
         }

         // Check cluster exists
         const clusterExists = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!clusterExists) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         // Check if clusters current team wont be left without clusters
         if (clusterExists.teamId) {
            const cluster_count = await db.collection('cluster').countDocuments({
               teamId: clusterExists.teamId
            });

            if (cluster_count <= 1) {
               return res.status(422).json({
                  success: false,
                  error: "Can't remove cluster as the team would be left without a cluster"
               });
            }
         }

         // Check that team exists
         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(sanitizedTeamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         // Add the cluster to the team in the database
         await db
            .collection('cluster')
            .updateOne({ _id: new ObjectId(sanitizedId) }, { $set: { teamId: sanitizedTeamId } });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
