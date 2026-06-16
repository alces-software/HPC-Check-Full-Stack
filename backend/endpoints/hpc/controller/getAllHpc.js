/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllHpc(req, res) {
      try {
         const response = await db.collection('cluster').find({}).toArray().then(results => {
            return results.map(data => ({
               id: data._id.toString(),
               name: data.name,
               teamId: data.teamId
            }));
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   return getAllHpc;
};