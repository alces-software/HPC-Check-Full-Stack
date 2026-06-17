const { generateSchedule } = require('../../../services/cron/methods/schedule')

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
      generateSchedule(db)
      return res.status(200).json({ success: true })
   };
};