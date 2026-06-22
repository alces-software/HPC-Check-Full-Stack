/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   return async (req, res) => {
      try {
         const { day } = req.body || {};

         if (!day) {
            return res.status(400).json({
               success: false,
               error: 'Missing day'
            });
         }

         const date = new Date(day);

         if (isNaN(date.getTime())) {
            return res.status(400).json({
               success: false,
               error: 'Invalid date'
            });
         }

         date.setHours(0, 0, 0, 0);

         const collection = db.collection('closedDay');

         const existing = await collection.findOne({
            day: date
         });

         if (existing) {
            return res.status(409).json({
               success: false,
               error: 'Office already marked closed for this day'
            });
         }

         await collection.insertOne({
            day: date
         });

         return res.status(201).json({
            success: true,
            body: {
               day
            }
         });
      } catch (error) {
         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};
