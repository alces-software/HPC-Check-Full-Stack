/**
 * @param {import('mongodb').Db} db
 */
module.exports = db =>
    require('express')
        .Router()
        // GET
        .get('/hpc', require('./controller/getAllHpc')(db))
        .get('/hpc/id/:id', require('./controller/getHpcById')(db))
        .get('/hpc/name/:name', require('./controller/getHpcByName')(db))
        .get('/hpc/pool/not/:id', require('./controller/getHpcNotInPool')(db))
        .get('/hpc/pool/:id', require('./controller/getHpcByPool')(db))
        // POST
        .post('/hpc', require('./controller/addHpc')(db))
        // DELETE
        .delete('/hpc', require('./controller/deleteHpc')(db))
        // UPDATE
        .patch('/hpc/pool/add/:id', require('./controller/addHpcToPool')(db))
        .patch('/hpc/pool/remove/:id', require('./controller/removeHpcFromPool')(db));
