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

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing instruction id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid instruction id provided" });
         }

         const response = await db.collection('instruction')
            .findOne({
               _id: new ObjectId(id)
            });

         if (!response) {
            return res.status(409).json({ success: false, error: 'Instruction does\'t exist' });
         }

         response.id = response._id.toString();
         delete response._id;
         response.methods = [];

         const methods = await db.collection('method')
            .find({
               instructionId: response.id
            })
            .toArray()
            .then(result => result
               .map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest
               }))
            );

         methods.forEach(m => {
            const methodData = m;
            methodData.id = m.id;
            delete methodData._id;

            response.methods.push(methodData);
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};