/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      postHpc,
      getAllHpc,
      getHpcById,
      getHpcByName,
      deleteHpc
   } = require('./controller')(db);

   router.post('/hpc/add', postHpc);
   router.get('/hpc', getAllHpc);
   router.get('/hpc/id/:id', getHpcById);
   router.get('/hpc/name/:name', getHpcByName);
   router.delete('/hpc/delete', deleteHpc);

   return router;
}