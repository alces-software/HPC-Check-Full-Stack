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
   return response;
}

async function getTeamsOrderedByEffectiveCapacity(db) {
   const teams = await getTeams(db);

   const teamStats = await Promise.all(
      teams.map(async (team) => {
         // Pools this team belongs to
         const pools = await db.collection('teampool').find({ teamId: team.id }).toArray();

         const poolIds = pools.map((p) => p.poolId);

         // All clusters available to this team
         const clusters = await db
            .collection('cluster')
            .find({ poolId: { $in: poolIds } })
            .toArray();

         let exclusiveCount = 0;

         // Count clusters that are only available to this team
         for (const cluster of clusters) {
            const otherTeams = await db
               .collection('teampool')
               .find({
                  poolId: cluster.poolId,
                  teamId: { $ne: team.id }
               })
               .limit(1)
               .toArray();

            if (otherTeams.length === 0) {
               exclusiveCount++;
            }
         }

         return {
            ...team,
            effectiveCapacity: team.capacity - exclusiveCount
         };
      })
   );

   // Shuffle first so equal capacities become random
   teamStats.sort(() => Math.random() - 0.5);

   // Then stable sort by descending effective capacity
   teamStats.sort((a, b) => b.effectiveCapacity - a.effectiveCapacity);

   return teamStats;
}

async function isWorkingDay(db, date) {
   const day = new Date(date);
   day.setHours(0, 0, 0, 0);
   const isWeekend = day.getDay() === 0 || day.getDay() === 6;
   if (isWeekend) {
      return false;
   }
   const response = await db.collection('closedDay').findOne({ day: day });

   return !response;
}

/**
 * gets an array of team IDs
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date} date - MongoDB database instance.
 */
async function generateScheduleForDay(db, date) {
   const teams = await getTeamsOrderedByEffectiveCapacity(db);

   for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      // get pools for team
      const pools = await db.collection('teampool').find({ teamId: team.id }).toArray();
      const poolIds = pools.map((p) => p.poolId);

      // get the last team.clustersPerDay clusters that are in all the pools ordered by the last time they appeared in the schedule
      const clusters = await db
         .collection('cluster')
         .find({ poolId: { $in: poolIds } })
         .toArray();

      const lastUsage = await db
         .collection('schedule')
         .aggregate([
            {
               $match: {
                  clusterId: { $in: clusters.map((c) => c._id.toString()) }
               }
            },
            {
               $group: {
                  _id: '$clusterId',
                  lastDay: { $max: '$day' }
               }
            }
         ])
         .toArray();

      const lastMap = new Map(lastUsage.map((x) => [x._id, x.lastDay]));

      clusters.sort((a, b) => {
         const aTime = lastMap.get(a._id.toString())?.getTime() ?? -Infinity;
         const bTime = lastMap.get(b._id.toString())?.getTime() ?? -Infinity;
         return aTime - bTime;
      });

      const selectedClusters = clusters.slice(0, team.clustersPerDay);

      // for each of them assign a random person from that team to it checking for the flag
      for (const cluster of selectedClusters) {
         const person = await getNextPerson(db, team.id);

         await db.collection('schedule').insertOne({
            personId: person._id.toString(),
            clusterId: cluster._id.toString(),
            day: date
         });
      }
   }
}

/**
 * Gets the next random person in a team
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date|string|number} date - Date to build the schedule for.
 */
async function getNextPerson(db, teamId) {
   console.log(`Getting next person for team: ${teamId}`);
   let people = await db
      .collection('person')
      .find({
         teamId: teamId,
         $or: [{ scheduled: false }, { scheduled: { $exists: false } }]
      })
      .toArray();

   if (people.length === 0) {
      console.log('People assigned, unscheduling people...');
      await db.collection('person').updateMany(
         { teamId: teamId },
         {
            $set: {
               scheduled: false
            }
         }
      );
      people = await db
         .collection('person')
         .find({
            teamId: teamId,
            $or: [{ scheduled: false }, { scheduled: { $exists: false } }]
         })
         .toArray();
   }

   const person = people[Math.floor(Math.random() * people.length)];

   await db.collection('person').updateOne(
      { _id: person._id },
      {
         $set: {
            scheduled: true
         }
      }
   );

   return person;
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

   const latest = await db.collection('schedule').findOne({}, { sort: { day: -1 } });

   const yesterday = new Date();
   yesterday.setDate(yesterday.getDate() - 1);
   yesterday.setHours(0, 0, 0, 0);

   const latestDay = latest?.day ? new Date(latest.day) : null;

   const startDate = !latestDay || latestDay < yesterday ? yesterday : latestDay;

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

   for (let i = 0; i < dates.length; i++) {
      await generateScheduleForDay(db, dates[i]);
   }
}

const scheduleLocks = new Map();

async function getScheduleForDay(db, date) {
   // Normalise date
   const startOfDay = new Date(date);
   startOfDay.setHours(0, 0, 0, 0);

   const lockKey = startOfDay.toISOString();

   // If another request is already generating this day,
   // wait for its result instead
   if (scheduleLocks.has(lockKey)) {
      await scheduleLocks.get(lockKey);

      return db.collection('schedule').find({ day: startOfDay }).toArray();
   }

   // Create a promise representing this generation process
   const lock = (async () => {
      try {
         let scheduleForDay = await db.collection('schedule').find({ day: startOfDay }).toArray();

         if (scheduleForDay.length === 0) {
            await generateUpToDay(db, date);

            scheduleForDay = await db.collection('schedule').find({ day: startOfDay }).toArray();
         }

         return scheduleForDay;
      } finally {
         scheduleLocks.delete(lockKey);
      }
   })();

   scheduleLocks.set(lockKey, lock);

   return lock;
}

/**
 * Build the schedule for a specific calendar date.
 *
 * @param {import('mongodb').Db} db - MongoDB database instance.
 * @param {Date|string|number} date - Date to build the schedule for.
 * @returns {Promise<Array>} Array of objects containing person IDs and cluster IDs.
 */
async function formatScheduleForDay(db, date) {
   const scheduleForDay = await getScheduleForDay(db, date);

   // Format response
   const response = scheduleForDay.map((entry) => ({
      personId: entry.personId,
      clusterId: entry.clusterId
   }));

   const scheduleDict = {};

   for (let i = 0; i < response.length; i++) {
      const person = response[i].personId;
      const cluster = response[i].clusterId;

      (scheduleDict[person] ??= []).push(cluster);
   }

   return scheduleDict;
}

module.exports = formatScheduleForDay;
