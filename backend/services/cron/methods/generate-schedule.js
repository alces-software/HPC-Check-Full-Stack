
module.exports.generateSchedule = async (db) => {
    console.log("Generating schedule");

    // Get all people from the database
    let peopleIDs = await db.collection('person').find({}).project({_id: 1}).toArray()
    peopleIDs = peopleIDs.map((id) => id._id.toString())
    // Get all clusters from the database
    let clusterIDs = await db.collection('cluster').find({}).project({_id: 1}).toArray()
    clusterIDs = clusterIDs.map((id) => id._id.toString())
    
    const per_person = Number(process.env.CLUSTERS_PER_PERSON) || 1
    const per_day = Number(process.env.PEOPLE_PER_DAY) || 1

    const people = {}
    peopleIDs.forEach(id => {
       people[id] = false
    });
    const clusters = {}
    clusterIDs.forEach(id => {
        clusters[id] = false
    })

    const scheduleEntries = []
    let personIndex = 0
    let clusterIndex = 0

    for (let day = 0; day < 5; day++) {
        const selectedPeople = []

        for (let j = 0; j < per_day; j++) {
            const personId = peopleIDs[personIndex % peopleIDs.length]
            people[personId] = true
            selectedPeople.push(personId)
            personIndex++
        }

        for (const personId of selectedPeople) {
            for (let j = 0; j < per_person; j++) {
                const clusterId = clusterIDs[clusterIndex % clusterIDs.length]
                clusters[clusterId] = true
                scheduleEntries.push({
                    clusterId: clusterId,
                    personId: personId,
                    dayIndex: day
                })
                clusterIndex++
            }
        }
    }

    if (scheduleEntries.length > 0) {
        await db.collection('schedule').deleteMany({})
        await db.collection('schedule').insertMany(scheduleEntries)
    }

    return scheduleEntries
}