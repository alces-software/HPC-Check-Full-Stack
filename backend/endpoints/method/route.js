/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getMethods,
      getMethodById,
      addMethod,
      deleteMethod
   } = require('./controller')(db);

   router.get('/method/:id', getMethods);
   router.get('/method/id/:id', getMethodById);
   router.post('/method/add', addMethod);
   router.delete('/method/delete', deleteMethod);

   return router;
}