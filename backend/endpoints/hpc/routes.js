/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => require('express').Router()
   // GET
   .get('/hpc', require('./controller/getAllHpc')(db))
   .get('/hpc/id/:id', require('./controller/getHpcById')(db))
   .get('/hpc/name/:name', require('./controller/getHpcByName')(db))
   .get('/hpc/team/:id', require('./controller/getHpcByTeam')(db))
   .get('/hpc/team/not/:id', require('./controller/getHpcNotInTeam')(db))
   // POST
   .post('/hpc', require('./controller/addHpc')(db))
   // DELETE
   .delete('/hpc', require('./controller/deleteHpc')(db))
   // UPDATE
   .patch('/hpc/team/:id', require('./controller/addHpcToTeam')(db));