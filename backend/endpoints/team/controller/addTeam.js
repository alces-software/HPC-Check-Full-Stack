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
         const { name: rawName } = req.body || {};

         // Check name
         if (rawName === undefined || rawName === null) {
            return res.status(400).json({ success: false, error: "Missing team's name" });
         }

         if (typeof rawName !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The name provided is not a string' });
         }

         const name = rawName.trim();

         if (!name) {
            return res.status(400).json({ success: false, error: 'The name provided is empty' });
         }

         const existingTeam = await db.collection('team').findOne({
            name: {
               $regex: `^${name}$`,
               $options: 'i'
            }
         });

         if (existingTeam) {
            return res.status(409).json({ success: false, error: 'Team already exits' });
         }

         // Add team to database
         await db.collection('team').insertOne({
            name,
            clusters_per_day: 1
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
