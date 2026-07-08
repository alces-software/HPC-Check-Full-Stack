const { ObjectId } = require('mongodb');
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
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({
               success: false,
               error: 'Missing person id'
            });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({
               success: false,
               error: 'Invalid person id provided'
            });
         }

         // 1. Fetch person
         const person = await db.collection('person').findOne({
            _id: new ObjectId(id)
         });

         if (!person) {
            return res.status(404).json({
               success: false,
               error: 'Person not found'
            });
         }

         if (!person.teamId) {
            return res.status(404).json({
               success: false,
               error: 'Person is not assigned to a team'
            });
         }

         // 2. Get today's schedule
         const today = new Date();
         const scheduleForToday = await getDaily(db, today);

         if (scheduleForToday && scheduleForToday.closed) {
            return res.status(200).json({
               success: true,
               body: { closed: true }
            });
         }

         // Use helper to enrich schedule and pick this person's entry
         const enriched = await enrichSchedule(db, scheduleForToday, { includeTeam: false });

         const personEntry =
            enriched[person.name] ?? { id: person._id.toString(), clusters: [] };

         return res.status(200).json({
            success: true,
            body: { [person.name]: personEntry }
         });
      } catch (error) {
         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};
