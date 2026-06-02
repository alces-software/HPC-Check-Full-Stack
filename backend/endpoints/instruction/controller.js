/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllInstructionsData(req, res) {
      try {
         if (req.params.clusterId) {
            const response = [];

            const instructions = await db.collection('instruction').find({
               clusterId: req.params.clusterId
            }).toArray();

            for (const i of instructions) {
               const methods = await db.collection('method').find({
                  instructionId: i._id.toString()
               }).toArray();

               const instructionData = i;
               instructionData.id = i._id.toString();
               delete instructionData._id;
               instructionData.methods = [];

               methods.forEach(m => {
                  const methodData = m;
                  methodData.id = m._id.toString();
                  delete methodData._id;

                  instructionData.methods.push(methodData);
               });

               response.push(instructionData);
            }

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getAllInstructionsData
   }
}