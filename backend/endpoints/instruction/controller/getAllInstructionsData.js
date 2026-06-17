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
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }
         const response = [];

         const instructions = await db.collection('instruction')
            .find({
               clusterId: id
            })
            .toArray()
            .then(result => result
               .map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest
               }))
            );

         for (const i of instructions) {
            const methods = await db.collection('method')
               .find({
                  instructionId: i.id
               })
               .toArray()
               .then(result => result
                  .map(({ _id, ...rest }) => ({
                     id: _id.toString(),
                     ...rest
                  }))
               );

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
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};