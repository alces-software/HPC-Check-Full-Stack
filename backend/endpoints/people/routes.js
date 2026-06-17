/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => require('express').Router()
   // GET
   .get('/people', require('./controller/getAllPeople')(db))
   .get('/people/id/:id', require('./controller/getPeopleById')(db))
   .get('/people/name/:name', require('./controller/getPeopleByName')(db))
   .get('/people/team/:id', require('./controller/getPeopleByTeam')(db))
   .get('/people/team/not/:id', require('./controller/getPeopleNotInTeam')(db))
   // POST
   .post('/people', require('./controller/addPeople')(db))
   // DELETE
   .delete('/people', require('./controller/deletePeople')(db))
   // UPDATE
   .patch('/people/team/:id', require('./controller/addPeopleToTeam')(db));