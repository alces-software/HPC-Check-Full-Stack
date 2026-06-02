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
   async function getAllInstructionsData(req, res) {
      try {
         if (req.params.id) {
            const response = [];

            const instructions = await db.collection('instruction').find({
               clusterId: req.params.clusterId
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }))
            });

            for (const i of instructions) {
               const methods = await db.collection('method').find({
                  instructionId: i.id
               }).toArray().then(result => {
                  return result.map(({ _id, ...rest }) => ({
                     ...rest,
                     id: _id.toString()
                  }))
               });

               i.methods = [];

               methods.forEach(m => {
                  const methodData = m;
                  methodData.id = m.id;
                  delete methodData._id;

                  i.methods.push(methodData);
               });

               response.push(i);
            }

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllInstructionsOnly(req, res) {
      try {
         if (req.params.id) {
            const response = await db.collection('instruction').find({
               clusterId: req.params.id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }))
            });

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getInstructionsAllById(req, res) {
      try {
         if (req.params.id) {
            const response = await db.collection('instruction').findOne({
               _id: new ObjectId(req.params.id)
            });

            if (!response) {
               return res.status(409).json({ success: false, error: 'Instruction does\'t exist' });
            }

            response.id = response._id.toString();
            delete response._id;
            response.methods = [];

            const methods = await db.collection('method').find({
               instructionId: response.id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }))
            });

            methods.forEach(m => {
               const methodData = m;
               methodData.id = m.id;
               delete methodData._id;

               response.methods.push(methodData);
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
   async function getInstructionsOnlyById(req, res) {
      try {
         if (req.params.id) {
            const response = await db.collection('instruction').findOne({
               _id: new ObjectId(req.params.id)
            });

            if (!response) {
               return res.status(409).json({ success: false, error: 'Instruction does\'t exist' });
            }

            response.id = response._id.toString();
            delete response._id;

            return res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing instruction id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getAllInstructionsData,
      getAllInstructionsOnly,
      getInstructionsAllById,
      getInstructionsOnlyById
   }
}