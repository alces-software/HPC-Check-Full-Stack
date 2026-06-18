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

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing hpc id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The hpc id you\'ve provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

         // Check cluster exists
         const existingCluster = await db.collection('cluster')
            .findOneAndDelete({
               _id: new ObjectId(sanitizedId)
            });

         if (!existingCluster) {
            return res.status(409).json({
               success: false, error: 'HPC doesn\'t exists'
            });
         }

         // Check if cluster has reports
         const reports = await db.collection('report').
            find({
               clusterId: sanitizedId
            }).
            toArray()
            .then(res => res
               .map(({ _id }) => ({
                  _id: _id
               }))
            );

         if (reports.length == 0) {
            return res.status(200).json({ success: true });
         }

         // Delete each report associated with the cluster
         reports.forEach(async report => {
            await db.collection('result')
               .deleteMany({
                  reportId: report._id
               });
         });

         await db.collection('report')
            .deleteMany({
               _id: { $in: reports.map(r => r._id) }
            });

         // Delete each instruction and method linked to the cluster
         const instructions = await db.collection('instruction')
            .find({
               clusterId: new ObjectId(sanitizedId)
            })
            .toArray()
            .then(res => res
               .map(({ _id }) => ({
                  _id: _id
               }))
            );

         instructions.forEach(async instruction => {
            await db.collection('method')
               .deleteMany({
                  instructionId: instruction._id
               });
         });

         await db.collection('instruction')
            .deleteMany({
               _id: { $in: instructions.map(i => i._id) }
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};