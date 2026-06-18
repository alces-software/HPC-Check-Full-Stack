const { ObjectId } = require('mongodb');
const Scheduler = require('../../../schedule/scheduler');
const { getDaily } = require('../weeklySchedule');

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
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing person id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid person id provided' });
         }

         const person = await db.collection('person').findOne({ _id: new ObjectId(id) });

         if (!person) {
            return res.status(404).json({ success: false, error: 'Person not found' });
         }

         if (!person.teamId) {
            return res.status(404).json({ success: false, error: 'Person is not assigned to a team' });
         }


         const today = new Date();
         const scheduleForToday = await getDaily(db, today);
         const assignedClusterIds = scheduleForToday[id] || [];

         const response = assignedClusterIds.map((clusterId) => clusterId);

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};