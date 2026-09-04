import { Long } from 'mongodb';

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
         // Get people
         const people = await db
            .collection('person')
            .find({})
            .toArray()
            .then((res) =>
               res.map((data) => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         // Get clusters
         const cluster = await db
            .collection('cluster')
            .find({})
            .toArray()
            .then((res) =>
               res.map((data) => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         // Get all the reports from today
         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         const response = await db
            .collection('report')
            .find({
               startDate: {
                  $gte: Long.fromNumber(startOfDay.getTime()),
                  $lte: Long.fromNumber(endOfDay.getTime())
               }
            })
            .toArray()
            .then((res) =>
               res.map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  person: people.find((p) => p.id === rest.personId)?.name,
                  cluster: cluster.find((c) => c.id === rest.clusterId)?.name,
                  ...rest
               }))
            );

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
