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

    const schedules = [];
    
    for (const team of teams) {
        const { nameScheduler, idScheduler } = await initialiseSchedulers(db, team);
        const nameSchedule = await nameScheduler.getScheduleForDay(db, new Date(day));
        const idSchedule = await idScheduler.getScheduleForDay(db, new Date(day));
        console.log(nameSchedule)
        console.log(idSchedule)
        schedules.push();
    }
    return schedules;
}

async function getWeekly(db, date=new Date()) {
     

    const teams = await getTeams(db);

    const schedules = [];
    
    for (const team of teams) {
        const {nameScheduler} = await initialiseSchedulers(db, team);

        schedules.push(await nameScheduler.getScheduleForWeek(db, date));
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

    return response
}

module.exports ={
  getWeekly,
  getDaily
}