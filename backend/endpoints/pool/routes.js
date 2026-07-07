/**
 * @param {import('mongodb').Db} db
 */
module.exports = db =>
    require('express')
        .Router()
        // GET
        .get('/pool', require('./controller/getAllPools')(db))
        .get('/pool/id/:id', require('./controller/getPool')(db))
        .get('/pool/cluster/:id', require('./controller/getPoolByCluster')(db))
        .get('/pool/team/:id', require('./controller/getPoolsByTeam')(db))
        .get('/pool/team/not/:id', require('./controller/getPoolsNotInTeam')(db))
        // POST
        .post('/pool', require('./controller/createPool')(db))
        .post('/pool/team/:id', require('./controller/addPoolToTeam')(db))
        // DELETE
        .delete('/pool/team/:id', require('./controller/removePoolFromTeam')(db));
