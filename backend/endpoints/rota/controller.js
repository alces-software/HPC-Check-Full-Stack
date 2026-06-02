/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * Handles the get request for the rota endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getRota(req, res) {
      try {
         const collection = await db.collection('schedule');
         const results = await collection.find({})
            .toArray();
         console.log(results);
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   return {
      getRota
   };
}