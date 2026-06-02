/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      // postPeople,
      getPeople,
      // updatePeople,
      // deletePeople
   } = require('./controller')(db);

   // router.post(postPeople);
   router.get('/people', getPeople);
   router.get('/people/:id', getPeople)
   // router.put(updatePeople);
   // router.delete(deletePeople);

   return router;
}