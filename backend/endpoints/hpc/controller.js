/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * Handles the post request for the HPC endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function postHpc(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the get request for the Hpc endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpc(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the put request for the Hpc endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function updateHpc(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the delete request for the Hpc endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteHpc(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   return {
      postHpc,
      getHpc,
      updateHpc,
      deleteHpc
   };
}