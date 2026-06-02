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
   async function getMethods(req, res) {
      try {
         if (req.params.instructionId) {
            const instructionExists = await db.collection('instruction').find({
               _id: new ObjectId(req.params.instructionId)
            });

            if (!instructionExists) {
               return res.status(409).json({ success: false, error: 'Instruction does\'t exist' });
            }

            const response = await db.collection('method').find({
               instructionId: req.params.instructionId
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }))
            });

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing instruction id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getMethodById(req, res) {
      try {
         if (req.params.methodId) {
            const response = await db.collection('method').find({
               _id: new ObjectId(req.params.instructionId)
            });

            if (!response) {
               return res.status(409).json({ success: false, error: 'Method does\'t exist' });
            }

            response.id = req.params.id;
            delete response._id;

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing method id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getMethods,
      getMethodById
   }
}