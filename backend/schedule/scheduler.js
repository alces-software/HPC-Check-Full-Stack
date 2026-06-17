class Scheduler {
    /**
     * @param {Array<string>} people - Array of person IDs
     * @param {Array<string>} clusters - Array of cluster IDs
     * @param {number} cpd - Number of clusters per day
     */
    constructor(people, clusters, cpd) {
        this.people = people;
        this.clusters = clusters;
        this.cpd = cpd
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
}

module.exports = Scheduler;