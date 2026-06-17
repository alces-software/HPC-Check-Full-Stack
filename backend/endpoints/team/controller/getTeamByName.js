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

         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing teams name' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length == 0) {
            return res.status(400).json({ success: false, error: "The name provided is empty" });
         }

         const results = await db.collection('team')
            .findOne({
               name: { $regex: `^${sanitizedName}$`, $options: "i" }
            });

         if (!results) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         return res.status(200).json({
            success: true, body: {
               id: results._id.toString(),
               name: results.name
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }
};