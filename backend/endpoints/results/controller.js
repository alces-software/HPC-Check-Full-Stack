/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function addResult(req, res) {
      try {
         
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      addResult
   }
}