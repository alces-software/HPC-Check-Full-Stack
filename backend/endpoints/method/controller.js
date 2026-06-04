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
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid instruction id provided" });
            }

            const instructionExists = await db.collection('instruction').findOne({
               _id: new ObjectId(id)
            });

            if (!instructionExists) {
               return res.status(409).json({ success: false, error: 'Instruction does\'t exist' });
            }

            const response = await db.collection('method').find({
               instructionId: id
            }).toArray().then(result => {
               return result.map(({ _id, ...rest }) => ({
                  ...rest,
                  id: _id.toString()
               }));
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: 'Missing instruction id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getMethodById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid method id provided" });
            }

            const response = await db.collection('method').findOne({
               _id: new ObjectId(id)
            });

            if (!response) {
               return res.status(409).json({ success: false, error: 'Method does\'t exist' });
            }

            response.id = id;
            delete response._id;

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: 'Missing method id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function addMethod(req, res) {
      try {
         const { id, content } = req.body || {};

         if (id && content) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid instruction id provided" });
            }

            const instructionExists = await db.collection('instruction').findOne({
               _id: new ObjectId(id)
            });

            if (!instructionExists) {
               return res.status(404).json({ success: false, error: "An instruction with that id doesn't exist" });
            }

            const sanitizedContent = String(content).trim();

            if (sanitizedContent.length == 0) {
               return res.status(400).json({ success: false, error: "The content provided is empty" });
            }

            await db.collection('method').insertOne({
               instructionId: id,
               content: sanitizedContent
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: "Invalid data is being passed in" })
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteMethod(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "The method is provided is invalid" });
            }

            await db.collection('method').findOneAndDelete({
               _id: new ObjectId(id)
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: "Missing method id" });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getMethods,
      getMethodById,
      addMethod,
      deleteMethod
   }
}