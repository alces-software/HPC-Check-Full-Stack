/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * Handles the post request for the people endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function postPeople(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the get request for the people endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getPeople(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the put request for the people endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function updatePeople(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   /**
    * Handles the delete request for the people endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deletePeople(req, res) {
      res.status(500).json({ success: false, error: 'Not implemented' });
   };

   return {
      postPeople,
      getPeople,
      updatePeople,
      deletePeople
   };
}