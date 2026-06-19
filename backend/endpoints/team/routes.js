/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) =>
   require('express')
      .Router()
      // GET
      .get('/teams', require('./controller/getAllTeam')(db))
      .get('/teams/id/:id', require('./controller/getTeamById')(db))
      .get('/teams/name/:name', require('./controller/getTeamByName')(db))
      // POST
      .post('/teams', require('./controller/addTeam')(db))
      // DELETE
      .delete('/teams', require('./controller/deleteTeam')(db))
      // UPDATE
      .patch('/teams', require('./controller/updateTeamSettings')(db));
