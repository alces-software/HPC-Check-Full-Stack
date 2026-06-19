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

         // Check name
         if (!name) {
            return res.status(400).json({ success: false, error: 'Missing persons name' });
         }

         const sanitizedName = String(name).trim();

         if (sanitizedName.length === 0) {
            return res.status(400).json({ success: false, error: 'The name provided is empty' });
         }

         // Make sure the person exists
         const existingPerson = await db.collection('person').findOne({
            name: {
               $regex: `^${sanitizedName}$`,
               $options: 'i',
            },
         });

         if (existingPerson) {
            return res.status(409).json({ success: false, error: 'Person already exits' });
         }

         // Add person to the database
         await db.collection('person').insertOne({
            name: sanitizedName,
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
