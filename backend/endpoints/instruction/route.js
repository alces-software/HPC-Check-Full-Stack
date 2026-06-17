/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => require('express').Router()
   // GET
   .get('/instruction/all/:id', require('./controller/getAllInstructionsData')(db))
   .get('/instruction/:id', require('./controller/getAllInstructionsOnly')(db))
   .get('/instruction/specific/all/:id', require('./controller/getInstructionsAllById')(db))
   .get('/instruction/specific/:id', require('./controller/getInstructionsOnlyById')(db));