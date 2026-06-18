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
        idScheduler: new Scheduler(peopleIds, clusterIds, Number(process.env.CLUSTERS_PER_DAY) || 1, new Date("2026-06-08")),
        nameScheduler: new Scheduler(peopleNames, clusterNames, Number(process.env.CLUSTERS_PER_DAY) || 1, new Date("2026-06-08"))
    };

    return schedulers;
}

async function getDaily(db, day) {
    const teams = await getTeams(db);

    const schedule = {};

    for (const team of teams) {
        const { idScheduler } = await initialiseSchedulers(db, team);
        const idSchedule = await idScheduler.getScheduleForDay(db, new Date(day));

        Object.assign(schedule, idSchedule);
    }

    return schedule;
}

async function getWeekly(db, date = new Date()) {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const weekly = {};

    // Copy the date so we don't modify the original
    const monday = new Date(date);

    // getDay(): Sun=0, Mon=1, ..., Sat=6
    const dayOfWeek = monday.getDay();

    // Number of days to subtract to get back to Monday
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