const seedrandom = require("seedrandom");

/**
 * Scheduler handles the generation of assignment sequences across working days.
 * It converts calendar dates to working-day indices and generates deterministic
 * person and cluster assignments for each day.
 */
class Scheduler {
    /**
     * Create a new Scheduler.
     *
     * @param {Array<string>} people - Array of person IDs.
     * @param {Array<string>} clusters - Array of cluster IDs.
     * @param {number} cpd - Number of clusters per day.
     * @param {Date|string|number} inception - Date that scheduler starts counting from.
     */
    constructor(people, clusters, cpd, inception) {
        this.people = people;
        this.clusters = clusters;
        this.cpd = cpd;
        this.inception = new Date(inception);
        if (isNaN(this.inception.getTime())) {
            throw new Error("Invalid inception date");
        }
        this.inception.setUTCHours(0, 0, 0, 0);
    }

    /**
     * Fetch UK bank holidays and persist them as closed days in MongoDB.
     *
     * @param {import('mongodb').Db} db - MongoDB database instance.
     * @returns {Promise<void>}
     */
    static async populateClosedDays(db) {
        const response = await fetch('https://www.gov.uk/bank-holidays.json');
        const data = await response.json();

        const holidays = data['england-and-wales'].events;

        const collection = db.collection('closedDay');

        const operations = holidays.map(h => {
        // Normalize to start-of-day (important for deduping)
        const day = new Date(h.date);
        day.setUTCHours(0, 0, 0, 0);

        return {
            updateOne: {
            filter: { day },
            update: {
                $setOnInsert: {
                day
                }
            },
            upsert: true
            }
        };
        });

        if (operations.length > 0) {
        await collection.bulkWrite(operations, { ordered: false });
        }

        console.log(`Processed ${operations.length} holidays`);
    }

    /**
     * Convert a calendar date into the number of working days since inception.
     * Weekends and closed days are excluded from the count.
     *
     * @param {import('mongodb').Db} db - MongoDB database instance.
     * @param {Date|string|number} date - Target date to convert.
     * @returns {Promise<number>} Number of working days since inception.
     */
    async dateToNowsi(db, date) {
        // Normalize inception and target date
        const start = this.inception;
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCHours(0, 0, 0, 0);

        if (end <= start) return 0;

        // Count weekdays 
        let workDays = 0;
        for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
        const dow = d.getUTCDay(); // 0 = Sun, 6 = Sat
        if (dow !== 0 && dow !== 6) workDays += 1;
        }

        // Get closed days from DB in the same range [start, end)
        const closedColl = db.collection('closedDay');
        const closedDocs = await closedColl
        .find({ day: { $gte: start, $lt: end } })
        .toArray();

        // Only subtract closed days that fall on weekdays
        const closedWeekdays = closedDocs.filter(cd => {
        const dow = new Date(cd.day).getUTCDay();
        return dow !== 0 && dow !== 6;
        }).length;

        return Math.max(0, workDays - closedWeekdays);
    }

    /**
     * Convert a working-day index into a calendar date.
     * Weekends and closed days are skipped when advancing from inception.
     *
     * @param {import('mongodb').Db} db - MongoDB database instance.
     * @param {number} nowsi - Working-day index since inception.
     * @returns {Promise<Date>} Date corresponding to the working-day index.
     */
    async nowsiToDate(db, nowsi) {
        const start = new Date(this.inception);
        start.setUTCHours(0, 0, 0, 0);

        if (nowsi <= 0) return start;

        // Get all closed days from inception onward (you can widen range if needed)
        const closedColl = db.collection('closedDay');

        const closedDocs = await closedColl.find({
            day: { $gte: start }
        }).toArray();

        // Put closed days into a Set for fast lookup
        const closedSet = new Set(
            closedDocs.map(d => new Date(d.day).toISOString().slice(0, 10))
        );

        let current = new Date(start);
        let remaining = nowsi;

        while (remaining > 0) {
            current.setUTCDate(current.getUTCDate() + 1);

            const isoDay = current.toISOString().slice(0, 10);
            const dow = current.getUTCDay();

            const isWeekend = dow === 0 || dow === 6;
            const isClosed = closedSet.has(isoDay);

            if (!isWeekend && !isClosed) {
            remaining--;
            }
        }

        return current;
    }

    /**
     * Generate a deterministic person assignment block from the given seed index.
     *
     * @param {number} index - Block index used to seed the shuffle.
     * @returns {Array<string>} Shuffled array of person IDs.
     */
    generatePersonBlock(index) {
        const rng = seedrandom(`Seed${index}`);

        const arr = [...this.people];

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));

            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Get the person assigned at the specified overall assignment index.
     *
     * @param {number} index - Overall assignment index.
     * @returns {string} Assigned person ID.
     */
    getPersonFromIndex(index) {
        const blockIndex = Math.floor(index/this.people.length);
        const posInBlock = index%this.people.length;

        const person = this.generatePersonBlock(blockIndex)[posInBlock];
        return person;
    }

    /**
     * Get the people assigned for a particular working day.
     *
     * @param {import('mongodb').Db} db - MongoDB database instance.
     * @param {number|Date|string|number} nowsi - Working-day index or a calendar date.
     * @returns {Promise<Array<string>>} Assigned person IDs for that day.
     */
    async getPeopleForDay(db, nowsi) {
        if (nowsi instanceof Date) {
            nowsi = await this.dateToNowsi(db, nowsi);
        }

        const totalPeople = nowsi * this.cpd;
        const people = [];
        for (let i=0; i<this.cpd; i++) {
            people.push(this.getPersonFromIndex(totalPeople+i));
        }
        return people;
    }

    /**
     * Get the cluster assigned at the specified overall assignment index.
     *
     * @param {number} index - Overall assignment index.
     * @returns {string} Assigned cluster ID.
     */
    getClusterFromIndex(index) {
        const posInBlock = index%this.clusters.length;

        const cluster = this.clusters[posInBlock];
        return cluster;
    }

    /**
     * Get the clusters assigned for a particular working day.
     *
     * @param {import('mongodb').Db} db - MongoDB database instance.
     * @param {number|Date|string|number} nowsi - Working-day index or a calendar date.
     * @returns {Promise<Array<string>>} Assigned cluster IDs for that day.
     */
    async getClustersForDay(db, nowsi) {
        if (nowsi instanceof Date) {
            nowsi = await this.dateToNowsi(db, nowsi);
        }

        const totalClusters = nowsi * this.cpd;
        const clusters = [];
        for (let i=0; i<this.cpd; i++) {
            clusters.push(this.getClusterFromIndex(totalClusters+i));
        }
        return clusters;
    }
}

module.exports = Scheduler;