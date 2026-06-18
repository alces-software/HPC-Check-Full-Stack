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
         const page = parseInt(req.query.page, 10) || 1;
         const limit = parseInt(req.query.limit, 10) || 20;
         const skip = (page - 1) * limit;

         // Get people
         const people = await db.collection('person')
            .find({})
            .toArray()
            .then(res => res
               .map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         // Get clusters
         const cluster = await db.collection('cluster')
            .find({})
            .toArray()
            .then(res => res
               .map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }))
            );

         const d = new Date();

         const day = d.getDay();
         const diffToMonday = day === 0 ? -6 : 1 - day;

         const start = new Date(req.query.start) || new Date(d);
         if (!req.query.start) {
            start.setDate(start.getDate() + diffToMonday);
         }
         start.setUTCHours(0, 0, 0, 0);

         const end = new Date(req.query.end) || new Date(defaultStart);
         if (!req.query.end) {
            end.setDate(end.getDate() + 6);
         }
         end.setUTCHours(23, 59, 59, 999);

         const query = {
            startDate: {
               $gte: start.getTime(),
               $lte: end.getTime()
            }
         };

         const [totalCount, results] = await Promise.all([
            db.collection('report').
               countDocuments(query),
            db.collection('report')
               .find(query)
               .sort({ startDate: -1 })
               .skip(skip)
               .limit(limit)
               .toArray()
         ]);

         const totalPages = Math.ceil(totalCount / limit);

         return res.status(200).json({
            success: true,
            body: results.map(({ _id, ...rest }) => ({
               id: _id.toString(),
               person: people.find(p => p.id === rest.personId)?.name,
               cluster: cluster.find(c => c.id === rest.clusterId)?.name,
               ...rest
            })),
            pagination: {
               totalCount,
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
   }
};