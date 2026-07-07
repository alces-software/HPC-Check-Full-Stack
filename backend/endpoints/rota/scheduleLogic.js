const getScheduleForDay = require('../../schedule/scheduler');

async function getDaily(db, day = new Date()) {

   const schedule = {};

   const targetDate = new Date(day);
   targetDate.setHours(0, 0, 0, 0);

   const endOfDay = new Date(day);
   endOfDay.setHours(23, 59, 59, 999);

   const isClosed = await db.collection('closedDay').findOne({
      day: targetDate
   });

   if (isClosed) {
      return {};
   }

   const overrides = await db
      .collection('scheduleOverride')
      .find({
         date: {
            $gte: targetDate,
            $lte: endOfDay
         }
      })
      .toArray();

   const overrideMap = new Map(overrides.map((o) => [o.personId, o.newPersonId]));

   const dailySchedule = await getScheduleForDay(db, new Date(day));

   for (const [personId, clusters] of Object.entries(dailySchedule)) {
      const finalPersonId = overrideMap.get(personId) ?? personId;

      if (!schedule[finalPersonId]) {
         schedule[finalPersonId] = [];
      }

      schedule[finalPersonId].push(...clusters);
   }

   return schedule;
}

async function getWeekly(db, date = new Date()) {
   const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
   const weekly = {};

   const monday = new Date(date);

   const dayOfWeek = monday.getDay();

   const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

   monday.setDate(monday.getDate() + diff);

   for (let i = days.length - 1; i >= 0; i--) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);

      weekly[days[i]] = await getDaily(db, currentDate);
   }

   return weekly;
}

module.exports = {
   getWeekly,
   getDaily
};
