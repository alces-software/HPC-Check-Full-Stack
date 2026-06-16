/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      addHpc,
      getAllHpc,
      getHpcById,
      getHpcByName,
      getHpcByTeam,
      deleteHpc,
      assignToTeam
   } = require('./controller')(db);

   router.post('/hpc/add', addHpc);
   router.get('/hpc', getAllHpc);
   router.get('/hpc/id/:id', getHpcById);
   router.get('/hpc/name/:name', getHpcByName);
   router.get('/hpc/team/:id', getHpcByTeam);
   router.delete('/hpc/delete', deleteHpc);
   router.patch('/hpc/team/:id', assignToTeam);

   return router;
}