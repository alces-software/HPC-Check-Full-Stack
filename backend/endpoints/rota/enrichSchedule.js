const { ObjectId } = require('mongodb');

/**
 * Enrich a schedule (daily assignments) by resolving person and cluster names.
 * If the input is { closed: true } it returns the same.
 *
 * @param {import('mongodb').Db} db
 * @param {Object} assignments
 * @param {{includeTeam?: boolean}} options
 */
module.exports = async function enrichSchedule(db, assignments, options = {}) {
   const includeTeam = options.includeTeam === true;

   if (!assignments || assignments.closed) {
      return { closed: true };
   }

   const personIds = new Set();
   const clusterIds = new Set();

   for (const [personId, cIds] of Object.entries(assignments)) {
      personIds.add(personId);

      if (Array.isArray(cIds)) {
         cIds.forEach((id) => clusterIds.add(id));
      }
   }

   const personObjectIds = [...personIds]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

   const clusterObjectIds = [...clusterIds]
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

   const [people, clusters] = await Promise.all([
      personObjectIds.length
         ? db.collection('person').find({ _id: { $in: personObjectIds } }).toArray()
         : [],
      clusterObjectIds.length
         ? db.collection('cluster').find({ _id: { $in: clusterObjectIds } }).toArray()
         : []
   ]);

   const peopleMap = new Map(
      people.map((p) => [p._id.toString(), { name: p.name, teamId: p.teamId }])
   );

   const clusterMap = new Map(clusters.map((c) => [c._id.toString(), c.name]));

   const enriched = Object.fromEntries(
      Object.entries(assignments).map(([personId, cIds]) => {
         const person = peopleMap.get(personId);

         const personName = person?.name ?? personId;

         const entry = {
            id: personId,
            clusters: (cIds || []).map((id) => ({ id, name: clusterMap.get(id) ?? id }))
         };

         if (includeTeam) {
            entry.teamId = person?.teamId ?? null;
         }

         return [personName, entry];
      })
   );

   return enriched;
};
