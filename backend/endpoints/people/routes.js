/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      postPeople,
      getAllPeople,
      getPeopleById,
      getPeopleByName,
      deletePeople
   } = require('./controller')(db);

   router.post('/people/add', postPeople);
   router.get('/people', getAllPeople);
   router.get('/people/id/:id', getPeopleById);
   router.get('/people/name/:name', getPeopleByName);
   router.delete('/people/delete', deletePeople);

   return router;
}