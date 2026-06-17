require('dotenv').config();
const Scheduler = require('../../../schedule/scheduler');
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
         const teams = await db.collection("team").find({}, {projection: { _id: 1 }}).toArray()
            .then(results =>
               results.map(data => data._id.toString())
            );

         const schedules = []
         
         for (const team of teams) {
            const people = await db.collection("person").find({ teamId: team }, {projection: { name: 1 }}).toArray()
               .then(results =>
                  results.map(data => data.name.toString())
               );
            const clusters = await db.collection("cluster").find({ teamId: team }, {projection: { name: 1 }}).toArray()
               .then(results =>
                  results.map(data => data.name.toString())
               );
            const scheduler = new Scheduler(people, clusters, process.env.CLUSTERS_PER_DAY, new Date("2026-06-08"));
            schedules.push(await scheduler.getScheduleForWeek(db, new Date()));
         }

         const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

         const response = schedules.reduce((acc, schedule) => {
            for (const day of days) {
               acc[day] ??= {};

               for (const [person, tasks] of Object.entries(schedule[day] || {})) {
                  acc[day][person] ??= [];
                  acc[day][person].push(...tasks);
               }
            }

            return acc;
         }, {});

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};