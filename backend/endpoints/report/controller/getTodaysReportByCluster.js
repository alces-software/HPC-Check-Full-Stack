const { ObjectId } = require('mongodb');

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

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is not a string' });
         }

         const sanitisedId = String(id).trim();

         if (sanitisedId.length === 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(sanitisedId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         // Gets people
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

         // Gets clusters
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

         // Gets all the reports for the cluster from today
         const startOfDay = new Date();
         startOfDay.setHours(0, 0, 0, 0);

         const endOfDay = new Date();
         endOfDay.setHours(23, 59, 59, 999);

         const response = await db
            .collection('report')
            .find({
               clusterId: sanitisedId,
               startDate: {
                  $gte: startOfDay.getTime(),
                  $lte: endOfDay.getTime()
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
