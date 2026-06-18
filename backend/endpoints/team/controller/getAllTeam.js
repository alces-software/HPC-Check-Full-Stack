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
         const response = await db.collection('team')
            .find({})
            .toArray()
            .then(res => res
               .map(data => ({
                  id: data._id.toString(),
                  name: data.name,
                  clusters_per_day: data.clusters_per_day
               }))
            );

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};