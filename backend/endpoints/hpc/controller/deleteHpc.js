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
   async function deleteHpc(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
            }

            const existingCluster = await db.collection('cluster').findOneAndDelete({
               _id: new ObjectId(id)
            });

            if (!existingCluster) {
               return res.status(409).json({
                  success: false, error: 'HPC doesn\'t exists'
               });
            }

            const reports = await db.collection('report').find({
               clusterId: id
            }).toArray().then(result => {
               return result.map(({ _id }) => ({
                  _id: _id
               }));
            });

            if (reports.length == 0) {
               return res.status(200).json({ success: true });
            }

            reports.forEach(async report => {
               await db.collection('result').deleteMany({
                  reportId: report._id
               });
            });

            await db.collection('report').deleteMany({ _id: { $in: reports.map(r => r._id) } });

            const instructions = await db.collection('instruction').find({
               clusterId: new ObjectId(id)
            }).toArray().then(result => {
               return result.map(({ _id }) => ({
                  _id: _id
               }));
            });

            instructions.forEach(async instruction => {
               await db.collection('method').deleteMany({
                  instructionId: instruction._id
               });
            });

            await db.collection('instruction').deleteMany({ _id: { $in: instructions.map(i => i._id) } });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing hpc id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   return deleteHpc;
};