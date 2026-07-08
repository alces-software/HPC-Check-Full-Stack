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
         const { day } = req.body || {};

         // Check day
         if (!day) {
            return res.status(400).json({ success: false, error: 'Missing day' });
         }

         if (typeof day !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The day provided is not a string' });
         }

         // Get date
         const date = new Date(day);

         if (isNaN(date.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid date' });
         }

         date.setHours(0, 0, 0, 0);

         // Check if the day is in the database already
         const existing = await db.collection('closedDay').findOne({ day: date });

         if (existing) {
            return res
               .status(409)
               .json({ success: false, error: 'Office already marked closed for this day' });
         }

         await db.collection('closedDay').insertOne({ day: date });

         return res.status(201).json({ success: true, body: { day } });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
