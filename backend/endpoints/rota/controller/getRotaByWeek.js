require('dotenv').config();
const { getWeekly } = require('../scheduleLogic');
const enrichSchedule = require('../enrichSchedule');

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
         const { date } = req.params || {};

         const dateObj = new Date(date);

         if (!date || isNaN(dateObj.getTime())) {
            return res.status(400).json({
               error: 'Invalid date'
            });
         }

         const weekly = await getWeekly(db, date);

         const enriched = {};

         for (const [day, assignments] of Object.entries(weekly)) {
            if (assignments && assignments.closed) {
               enriched[day] = { closed: true };
            } else {
               enriched[day] = await enrichSchedule(db, assignments, { includeTeam: true });
            }
         }

         return res.status(200).json({
            success: true,
            body: enriched
         });
      } catch (error) {
         console.error('rota enriched error:', error);

         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};
