require('dotenv').config();
const { ObjectId } = require('mongodb');
const { getWeekly } = require('../scheduleLogic');

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
         const weekly = await getWeekly(db);

         const personIds = new Set();
         const clusterIds = new Set();

         for (const assignments of Object.values(weekly)) {
            for (const [personId, cIds] of Object.entries(assignments)) {
               personIds.add(personId);

               if (Array.isArray(cIds)) {
                  cIds.forEach((id) => clusterIds.add(id));
               }
            }
         }

         const personObjectIds = [...personIds].map((id) => new ObjectId(id));
         const clusterObjectIds = [...clusterIds].map((id) => new ObjectId(id));

         const [people, clusters] = await Promise.all([
            personObjectIds.length
               ? db
                    .collection('person')
                    .find({ _id: { $in: personObjectIds } })
                    .toArray()
               : [],
            clusterObjectIds.length
               ? db
                    .collection('cluster')
                    .find({ _id: { $in: clusterObjectIds } })
                    .toArray()
               : [],
         ]);

         const peopleMap = new Map(people.map((p) => [p._id.toString(), p.name]));

         const clusterMap = new Map(clusters.map((c) => [c._id.toString(), c.name]));

         const enriched = Object.fromEntries(
            Object.entries(weekly).map(([day, assignments]) => [
               day,
               Object.fromEntries(
                  Object.entries(assignments).map(([personId, cIds]) => {
                     const personName = peopleMap.get(personId) ?? personId;

                     return [
                        personName,
                        {
                           id: personId,
                           clusters: (cIds || []).map((id) => ({
                              id,
                              name: clusterMap.get(id) ?? id,
                           })),
                        },
                     ];
                  }),
               ),
            ]),
         );
         return res.status(200).json({
            success: true,
            body: enriched,
         });
      } catch (error) {
         console.error('rota enriched error:', error);

         return res.status(500).json({
            success: false,
            error: error.message,
         });
      }
   };
};
