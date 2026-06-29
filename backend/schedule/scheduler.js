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
         res.map((data) => data._id.toString())
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

async function generateScheduleForDay(db, date) {
   
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
 * @returns {Promise<Record<string, string[]>>} Dictionary mapping person IDs to cluster IDs.
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
   }
   
   // Format response

   // Return response
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
   const scheduleDict = {};

   for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const cluster = clusters[i];

      (scheduleDict[person] ??= []).push(cluster);
   }

   return scheduleDict;
}

module.exports = getScheduleForDay;
