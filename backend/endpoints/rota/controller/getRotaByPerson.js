const { ObjectId } = require('mongodb');
const Scheduler = require('../../../schedule/scheduler');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
   return async (req, res) => {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing person id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid person id provided' });
         }

         const person = await db.collection('person').findOne({ _id: new ObjectId(id) });

         if (!person) {
            return res.status(404).json({ success: false, error: 'Person not found' });
         }

         if (!person.teamId) {
            return res.status(404).json({ success: false, error: 'Person is not assigned to a team' });
         }

         const [peopleDocs, clusterDocs] = await Promise.all([
            db.collection('person').find({ teamId: person.teamId }).toArray(),
            db.collection('cluster').find({ teamId: person.teamId }).toArray()
         ]);

         const peopleIds = peopleDocs.map((p) => p._id.toString());
         const clusterIds = clusterDocs.map((c) => c._id.toString());

         const clusterNameById = clusterDocs.reduce((acc, cluster) => {
            acc[cluster._id.toString()] = cluster.name;
            return acc;
         }, {});

         const scheduler = new Scheduler(
            peopleIds,
            clusterIds,
            Number(process.env.CLUSTERS_PER_DAY) || 1,
            new Date('2026-06-08')
         );

         const today = new Date();
         const scheduleForToday = await scheduler.getScheduleForDay(db, today);
         const assignedClusterIds = scheduleForToday[id] || [];

         const response = assignedClusterIds.map((clusterId) => ({
            id: clusterId,
            name: clusterNameById[clusterId] || null
         }));

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};