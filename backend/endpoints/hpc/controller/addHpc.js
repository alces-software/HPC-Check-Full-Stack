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
         const { name } = req.body || {};

         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing hpc name' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length == 0) {
            return res.status(400).json({ success: false, error: "The name provided is empty" });
         }

         const existingHpc = await db.collection('cluster')
            .findOne({
               name: sanitizedName
            });

         if (existingHpc) {
            return res.status(409).json({ success: false, error: 'HPC already exits' });
         }

         await db.collection('cluster')
            .insertOne({
               name: sanitizedName
            });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};