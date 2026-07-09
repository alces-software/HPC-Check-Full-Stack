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
            return res.status(400).json({ success: false, error: 'Missing the persons name' });
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

         // Make sure the person exists
         const person = await db.collection('person').findOne({
            name: {
               $regex: `^${name}$`,
               $options: 'i'
            }
         });

         if (person) {
            return res.status(409).json({ success: false, error: 'Person already exits' });
         }

         // Add person to the database
         await db.collection('person').insertOne({ name });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
