/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => require('express').Router()
   // GET
   .get('/method/:id', require('./controller/getMethods')(db))
   .get('/method/id/:id', require('./controller/getMethodById')(db))
   // POST
   .post('/method/add', require('./controller/addMethod')(db))
   // DELETE
   .delete('/method/delete', require('./controller/deleteMethod')(db))
   // UPDATE
   .patch('/method/update', require('./controller/updateMethod')(db));
