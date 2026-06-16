/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      addPeople,
      getAllPeople,
      getPeopleById,
      getPeopleByName,
      getPeopleByTeam,
      deletePeople,
      assignToTeam
   } = require('./controller')(db);

   router.post('/people/add', addPeople);
   router.get('/people', getAllPeople);
   router.get('/people/id/:id', getPeopleById);
   router.get('/people/name/:name', getPeopleByName);
   router.get('/people/team/:id', getPeopleByTeam)
   router.delete('/people/delete', deletePeople);
   router.patch('/people/team/:id', assignToTeam)

   return router;
}