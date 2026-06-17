const { dayFromIndex } = require('../../../enums/days');

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
         const results = await db.collection('schedule')
            .find({})
            .toArray();

         const people = await db.collection('person')
            .find({})
            .toArray()
            .then(res => res
               .map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         const cluster = await db.collection('cluster')
            .find({})
            .toArray()
            .then(res => res
               .map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         let response = {
            mon: {},
            tue: {},
            wed: {},
            thu: {},
            fri: {}
         }

         results.forEach(d => {
            const dayName = dayFromIndex(d.dayIndex);
            const personName = people.find(i => i.id == d.personId).name;
            const clusterName = cluster.find(i => i.id == d.clusterId).name;

            if (Object.hasOwn(response[dayName], personName)) {
               response[dayName][personName].push(clusterName);
            } else {
               response[dayName][personName] = [clusterName];
            }
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};