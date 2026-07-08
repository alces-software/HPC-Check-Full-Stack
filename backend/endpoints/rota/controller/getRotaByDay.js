require('dotenv').config();
const { getDaily } = require('../scheduleLogic');
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

         const daily = await getDaily(db, date);

         const enriched = await enrichSchedule(db, daily, { includeTeam: true });

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
