/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();

   // GET
   router.get('/hpc', require('./controller/getAllHpc')(db));
   router.get('/hpc/id/:id', require('./controller/getHpcById')(db));
   router.get('/hpc/name/:name', require('./controller/getHpcByName')(db));
   router.get('/hpc/team/:id', require('./controller/getHpcByTeam')(db));
   router.get('/hpc/notteam/:id', require('./controller/getHpcNotInTeam')(db));

   // POST
   router.post('/hpc/add', require('./controller/addHpc')(db));

   // DELETE
   router.delete('/hpc/delete', require('./controller/deleteHpc')(db));

   // UPDATE
   router.patch('/hpc/team/:id', require('./controller/assignToTeam')(db));

   return router;
}