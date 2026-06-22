const { ObjectId } = require('mongodb');
const { getDaily } = require('../scheduleLogic');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   return async (req, res) => {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({
               success: false,
               error: 'Missing person id'
            });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({
               success: false,
               error: 'Invalid person id provided'
            });
         }

         // 1. Fetch person
         const person = await db.collection('person').findOne({
            _id: new ObjectId(id)
         });

         if (!person) {
            return res.status(404).json({
               success: false,
               error: 'Person not found'
            });
         }

         if (!person.teamId) {
            return res.status(404).json({
               success: false,
               error: 'Person is not assigned to a team'
            });
         }

         // 2. Get today's schedule
         const today = new Date();
         const scheduleForToday = await getDaily(db, today);

         const assignedClusterIds = scheduleForToday[id] || [];

         // 3. Fetch cluster details in batch (better than per-loop lookup)
         const clusters = assignedClusterIds.length
            ? await db
                 .collection('cluster')
                 .find({
                    _id: { $in: assignedClusterIds.map((c) => new ObjectId(c)) }
                 })
                 .toArray()
            : [];

         const clusterMap = Object.fromEntries(clusters.map((c) => [c._id.toString(), c.name]));

         // 4. Build response (same structure as weekly endpoint)
         const result = {
            [person.name]: {
               id: person._id.toString(),
               clusters: assignedClusterIds.map((id) => ({
                  id,
                  name: clusterMap[id] ?? id
               }))
            }
         };

         return res.status(200).json({
            success: true,
            body: result
         });
      } catch (error) {
         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};
