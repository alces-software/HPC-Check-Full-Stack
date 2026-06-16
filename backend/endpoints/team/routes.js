/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getTeams,
      getTeamsById,
      getTeamsByName,
      addTeam,
      deleteTeam
   } = require('./controller')(db);

   router.get('/teams', getTeams);
   router.get('/teams/id/:id', getTeamsById);
   router.get('/teams/name/:name', getTeamsByName);
   router.post('/teams', addTeam);
   router.delete('/teams', deleteTeam);

   return router;
}