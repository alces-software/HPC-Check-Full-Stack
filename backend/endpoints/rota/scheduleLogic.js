const Scheduler = require('../../schedule/scheduler');

async function getTeams(db) {
    const teams = await db.collection("team").find({}, {projection: { _id: 1 }}).toArray()
        .then(results =>
            results.map(data => data._id.toString())
        );
    return teams
}

async function initialiseSchedulers(db, team) {
    let schedulers;
    const peopleDocs = await db.collection("person")
        .find({ teamId: team })
        .toArray();

    const peopleNames = peopleDocs.map(p => p.name);
    const peopleIds = peopleDocs.map(p => p._id.toString());

    const clusterDocs = await db.collection("cluster")
    .find({ teamId: team })
    .toArray();

    const clusterNames = clusterDocs.map(c => c.name);
    const clusterIds = clusterDocs.map(c => c._id.toString());

    schedulers = {
        idScheduler: new Scheduler(peopleIds, clusterIds, Number(process.env.CLUSTERS_PER_DAY) || 1, new Date("2026-06-08"), team),
        nameScheduler: new Scheduler(peopleNames, clusterNames, Number(process.env.CLUSTERS_PER_DAY) || 1, new Date("2026-06-08"), team)
    };

    return schedulers;
}

async function getDaily(db, day) {
    const teams = await getTeams(db);

    const schedule = {};

    const targetDate = new Date(day);
    targetDate.setHours(0, 0, 0, 0);

    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    const isClosed = await db.collection("closedDay").findOne({
        day: targetDate
    });

    if (isClosed) {
        return {};
    }

    const overrides = await db.collection("scheduleOverride").find({
        date: {
            $gte: targetDate,
            $lte: endOfDay
        }
    }).toArray();

    const overrideMap = new Map(
        overrides.map(o => [o.personId, o.newPersonId])
    );

    for (const team of teams) {
        const { idScheduler } = await initialiseSchedulers(db, team);
        const idSchedule = await idScheduler.getScheduleForDay(db, new Date(day));

        for (const [personId, clusters] of Object.entries(idSchedule)) {
            const finalPersonId =
                overrideMap.get(personId) ?? personId;

            if (!schedule[finalPersonId]) {
                schedule[finalPersonId] = [];
            }

            schedule[finalPersonId].push(...clusters);
        }
    }

    return schedule;
}

async function getWeekly(db, date = new Date()) {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const weekly = {};

    const monday = new Date(date);

    const dayOfWeek = monday.getDay();

    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    monday.setDate(monday.getDate() + diff);

    for (let i = 0; i < days.length; i++) {
        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);

        weekly[days[i]] = await getDaily(db, currentDate);
    }

    return weekly;
}

module.exports ={
  getWeekly,
  getDaily
}