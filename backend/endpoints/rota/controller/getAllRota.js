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
         const weekly = await getWeekly(db);

         const enriched = {};

         for (const [day, assignments] of Object.entries(weekly)) {
            if (assignments && assignments.closed) {
               enriched[day] = { closed: true };
            } else {
               enriched[day] = await enrichSchedule(db, assignments, { includeTeam: false });
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
