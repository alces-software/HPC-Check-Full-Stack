require('dotenv').config();
const {getWeekly} = require('../scheduleLogic');

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
               error: "Invalid date"
            });
         } 

         const response = await getWeekly(db, dateObj);
         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};