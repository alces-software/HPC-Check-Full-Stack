const { ObjectId, Long } = require('mongodb');

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
         const id = req.params.id || null;

         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 20;
         const skip = (page - 1) * limit;

         if (!id) {
            return res.status(400).json({ success: false, error: "Missing cluster id" });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid cluster id provided" });
         }

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

         const query = { clusterId: id };

         // run count + data in parallel
         const [total, data] = await Promise.all([
            db.collection('report').countDocuments(query),
            db.collection('report')
               .find(query)
               .sort({ startDate: -1 })
               .skip(skip)
               .limit(limit)
               .toArray()
         ]);

         const totalPages = Math.ceil(total / limit);

         return res.status(200).json({
            success: true,
            body: data.map(({ _id, ...rest }) => ({
               id: _id.toString(),
               person: people.find(p => p.id === rest.personId)?.name,
               cluster: cluster.find(c => c.id == rest.clusterId)?.name,
               ...rest
            })),
            pagination: {
               total,
               page,
               limit,
               totalPages,
               hasNextPage: page < totalPages,
               hasPrevPage: page > 1
            }
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};