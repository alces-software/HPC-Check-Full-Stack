const { indexFromDay, isValidDay } = require('../../../enums/days');

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
         const { day } = req.params || {};

         if (!day) {
            return res.status(400).json({ success: false, error: 'Missing day' });
         }

         if (!isValidDay(day)) {
            return res.status(400).json({ status: false, error: 'Invalid day provided' });
         }

         const results = await db.collection('schedule')
            .find({
               dayIndex: indexFromDay(day)
            })
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

         let response = [];

         results.forEach(d => {
            response.push({
               person: people.find(i => i.id == d.personId).name,
               personId: d.personId,
               cluster: cluster.find(i => i.id == d.clusterId).namerName,
               clusterId: d.clusterId,
               dayIndex: d.dayIndex
            });
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};