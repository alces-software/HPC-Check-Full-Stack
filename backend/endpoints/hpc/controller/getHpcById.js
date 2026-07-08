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
         const { id: rawClusterId } = req.params || {};

         // Check cluster id
         if (rawClusterId === undefined || rawClusterId === null) {
            return res.status(400).json({ success: false, error: 'Missing cluster ID' });
         }

         if (typeof rawClusterId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster ID provided is not a string' });
         }

         const clusterId = rawClusterId.trim();

         if (!clusterId) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster ID provided is empty' });
         }

         if (!ObjectId.isValid(clusterId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster ID provided' });
         }

         // Get the cluster
         const response = await db.collection('cluster').findOne({
            _id: new ObjectId(clusterId)
         });

         if (!response) {
            return res.status(404).json({ success: false, error: "Cluster doesn't exist" });
         }

         response.id = clusterId;
         delete response._id;

         return res.status(200).json({
            success: true,
            body: response
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
