const seedrandom = require("seedrandom");

class Scheduler {
    /**
     * @param {Array<string>} people - Array of person IDs
     * @param {Array<string>} clusters - Array of cluster IDs
     * @param {number} cpd - Number of clusters per day
     * @param {Date} inception - Date that scheduler starts counting from
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
     * @param {import('mongodb').Db} db
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
     * @param {import('mongodb').Db} db
     * @param {Date} date
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
     * @param {import('mongodb').Db} db
     * @param {int} nowsi
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

    generatePersonBlock(index) {
        const rng = seedrandom(`Seed${index}`);

        const arr = [...this.people];

        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));

            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    getPersonFromPersonNum(num) {
        const blockIndex = Math.floor(num/this.people.length);
        const posInBlock = num%this.people.length;

        const person = this.generatePersonBlock(blockIndex)[posInBlock];
        return person;
    }

    async getPeopleForDay(db, nowsi) {
        if (nowsi instanceof Date) {
            nowsi = await this.dateToNowsi(db, nowsi);
        }

        const totalPeople = nowsi * this.cpd;
        const people = [];
        for (let i=0; i<this.cpd; i++) {
            people.push(this.getPersonFromPersonNum(totalPeople+i));
        }
        return people;
    }
}

module.exports = Scheduler;