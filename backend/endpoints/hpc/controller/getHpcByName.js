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
         const { name } = req.params || {};

         // Check name
         if (typeof name !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The name provided is not a string' });
         }

         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing cluster name' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length == 0) {
            return res.status(400).json({ success: false, error: 'The name provided is empty' });
         }

         // Get the cluster
         const response = await db.collection('cluster').findOne({
            name: {
               $regex: `^${sanitizedName}$`,
               $options: 'i'
            }
         });

         if (!response) {
            return res.status(404).json({ success: false, error: "The cluster doesn't exist" });
         }

         response.id = response._id.toString();
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
