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
         const { name: rawName } = req.params || {};

         // Check name
         if (rawName === undefined || rawName === null) {
            return res.status(400).json({ success: false, error: 'Missing team name' });
         }

         if (typeof rawName !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The team name provided is not a string' });
         }

         const name = rawName.trim();

         if (!name) {
            return res.status(400).json({ success: false, error: 'The name provided is empty' });
         }

         // Get team
         const response = await db.collection('team').findOne({
            name: {
               $regex: `^${name}$`,
               $options: 'i'
            }
         });

         if (!response) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         response.id = response._id.toString();
         delete response._id;

         // Return team information
         return res.status(200).json({
            success: true,
            body: response
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
