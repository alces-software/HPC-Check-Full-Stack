
module.exports.generateSchedule = async (db) => {
    console.log("Generating schedule");

    // Get all people from the database
    let peopleIDs = await db.collection('person').find({}).project({ _id: 1 }).toArray().then(results => results.map((id) => id._id.toString()));
    // Get all clusters from the database
    let clusterIDs = await db.collection('cluster').find({}).project({ _id: 1 }).toArray().then(results => results.map((id) => id._id.toString()));

    const per_person = Number(process.env.CLUSTERS_PER_PERSON) || 1
    const per_day = Number(process.env.PEOPLE_PER_DAY) || 1

    const shuffle = (array) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    const scheduleEntries = []
    const peoplePool = shuffle(peopleIDs)
    const clusterPool = shuffle(clusterIDs)

    const getNextFromPool = (pool, source) => {
        if (pool.length === 0) {
            pool.push(...shuffle(source))
        }
        return pool.pop()
    }

    for (let day = 0; day < 5; day++) {
        const selectedPeople = []

        for (let j = 0; j < per_day; j++) {
            const personId = getNextFromPool(peoplePool, peopleIDs)
            selectedPeople.push(personId)
        }

        for (const personId of selectedPeople) {
            for (let j = 0; j < per_person; j++) {
                const clusterId = getNextFromPool(clusterPool, clusterIDs)
                scheduleEntries.push({
                    clusterId: clusterId,
                    personId: personId,
                    dayIndex: day
                })
            }
        }
    }

    if (scheduleEntries.length > 0) {
        await db.collection('schedule').deleteMany({})
        await db.collection('schedule').insertMany(scheduleEntries)
    }
}

module.exports.scheduleExists = async (db) => {
    return await db.collection('schedule').count() > 0
}