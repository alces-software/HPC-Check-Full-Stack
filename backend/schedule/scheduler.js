const seedrandom = require('seedrandom');
require('dotenv').config;

/**
 * gets an array of team IDs
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @returns {Promise<Array<string>} Team IDs
 */
async function getTeams(db) {
   const response = await db
      .collection('team')
      .find({})
      .toArray()
      .then((res) =>
         res.map((data) => ({
            id: data._id.toString(),
            clustersPerDay: data.clusters_per_day
         }))
      );
   return response
}

async function isWorkingDay(db, date) {
   const day = new Date(date);
   day.setHours(0, 0, 0, 0);
   const isWeekend = day.getDay() === 0 || day.getDay() === 6;
   if (isWeekend) {
      return false;
   }
   const response = await db
      .collection('closedDay')
      .findOne({day: day})
   
   return !response;
}

/**
 * gets an array of team IDs
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date} date - MongoDB database instance.
 */
async function generateScheduleForDay(db, date) {
   const teams = await getTeams(db);

   for (let i=0; i<teams.length; i++) {
      const team = teams[i]
      // get pools for team
      const pools = await db
         .collection('teampool')
         .find({ teamId: team.id })
         .toArray();
      const poolIds = pools.map(p => p.poolId);

      // get the last team.clustersPerDay clusters that are in all the pools ordered by the last time they appeared in the schedule
      const clusters = await db
         .collection('cluster')
         .find({ poolId: { $in: poolIds } })
         .toArray();
      
      const lastUsage = await db.collection('schedule').aggregate([
         {
            $match: {
               clusterId: { $in: clusters.map(c => c._id.toString()) }
            }
         },
         {
            $group: {
               _id: "$clusterId",
               lastDay: { $max: "$day" }
            }
         }
         ]).toArray();
      
      const lastMap = new Map(
         lastUsage.map(x => [x._id, x.lastDay])
      );

      clusters.sort((a, b) => {
         const aTime = lastMap.get(a._id.toString())?.getTime() ?? 0;
         const bTime = lastMap.get(b._id.toString())?.getTime() ?? 0;
         return aTime - bTime;
      });


      const selectedClusters = clusters.slice(0, team.clustersPerDay);

      // for each of them assign a random person from that team to it checking for the flag

      const people = await db
         .collection('person')
         .find({ teamId: team.id })
         .toArray();

      for (const cluster of selectedClusters) {

         const available = people.filter(p => !p.scheduled);

         if (available.length === 0) {
            people.forEach(p => p.scheduled = false);
         }

         const freshAvailable = people.filter(p => !p.scheduled);

         const personIndex = Math.floor(Math.random() * freshAvailable.length);
         const person = freshAvailable[personIndex];

         const scheduleObj = {
            personId: person._id.toString(),
            clusterId: cluster._id.toString(),
            day: date
         }

         await db.collection('schedule').insertOne(scheduleObj);

         person.scheduled = true;
      }

      console.log(people)

      await db.collection('person').bulkWrite(
         people.map(p => ({
            updateOne: {
               filter: { _id: p._id },
               update: { $set: { scheduled: p.scheduled ?? false } }
            }
         }))
      );
   }
}

/**
 * Generates the schedule up to a specific date and returns the specified date
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date|string|number} date - Date to build the schedule for.
 */
async function generateUpToDay(db, date) {
   const targetDate = new Date(date);
   targetDate.setHours(0, 0, 0, 0);

   const latest = await db
      .collection('schedule')
      .findOne({}, { sort: { day: -1 } });

   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const latestDay = latest?.day ? new Date(latest.day) : null;

   const startDate =
      !latestDay || latestDay < today
         ? today
         : latestDay;
   
   const dates = [];
   const cursor = new Date(startDate);
   cursor.setHours(0, 0, 0, 0);

   cursor.setDate(cursor.getDate() + 1);

   while (cursor <= targetDate) {
      const current = new Date(cursor);

      if (await isWorkingDay(db, current)) {
         dates.push(current);
      }

      cursor.setDate(cursor.getDate() + 1);
   }

   for (let i=0; i<dates.length; i++){
      generateScheduleForDay(db, dates[i])
   }
}

/**
 * Build the schedule for a specific calendar date.
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date|string|number} date - Date to build the schedule for.
 * @returns {Promise<Array>} Array of objects containing person IDs and cluster IDs.
 */
async function getScheduleForDay(db, date) {
   // Normalise date

   const startOfDay = new Date(date);
   startOfDay.setHours(0, 0, 0, 0);

   // Check if schedule exists for day
   let scheduleForDay = await db
      .collection('schedule')
      .find({ day: startOfDay })
      .toArray();
   
   
   // Generate schedule for day if not
   if (scheduleForDay.length === 0) {
      await generateUpToDay(db, date)

      scheduleForDay = await db
      .collection('schedule')
      .find({ day: startOfDay })
      .toArray();
   }

   // Format response
   const response = scheduleForDay.map((entry) => ({
      personId: entry.personId,
      clusterId: entry.clusterId
   }))

   const scheduleDict = {};

   for (let i = 0; i < response.length; i++) {
      const person = response[i].personId;
      const cluster = response[i].clusterId;

      (scheduleDict[person] ??= []).push(cluster);
   }

   return scheduleDict;
}

/**
 * Build the schedule for a specific calendar date.
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date|string|number} date - Date to build the schedule for.
 * @returns {Promise<Record<string, string[]>>} Dictionary mapping person IDs to cluster IDs.
 */
async function getScheduleForDayOLD(db, date) {
   const people = await this.getPeopleForDay(db, date);
   const clusters = await this.getClustersForDay(db, date);
}

module.exports = getScheduleForDay;
