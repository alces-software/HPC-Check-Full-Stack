require('dotenv').config();
const { getDaily } = require('../scheduleLogic');
const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = db => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   return async (req, res) => {
      try {
         const { date } = req.params || {};

         const dateObj = new Date(date);

         if (!date || isNaN(dateObj.getTime())) {
            return res.status(400).json({
               error: 'Invalid date'
            });
         }

         const daily = await getDaily(db, date);

         console.log(daily)

         const personIds = new Set();
         const clusterIds = new Set();

        for (const [personId, cIds] of Object.entries(daily)) {
            personIds.add(personId);

            if (Array.isArray(cIds)) {
                cIds.forEach(id => clusterIds.add(id));
            }
        }

         const personObjectIds = [...personIds].map(id => new ObjectId(id));
         const clusterObjectIds = [...clusterIds].map(id => new ObjectId(id));

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
               : []
         ]);

         const peopleMap = new Map(
            people.map(p => [p._id.toString(), { name: p.name, teamId: p.teamId }])
         );

         const clusterMap = new Map(clusters.map(c => [c._id.toString(), c.name]));

         const enriched = Object.fromEntries(
            Object.entries(daily).map(([personId, cIds]) => {
                const person = peopleMap.get(personId);

                const personName = person?.name ?? personId;

                return [
                personName,
                {
                    id: personId,
                    teamId: person?.teamId ?? null,
                    clusters: (cIds || []).map(id => ({
                        id,
                        name: clusterMap.get(id) ?? id
                    }))
                }
                ];
            })
         );

         return res.status(200).json({
            success: true,
            body: enriched
         });
      } catch (error) {
         console.error('rota enriched error:', error);

         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};
