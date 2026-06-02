/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      // postHpc, 
      getHpc,
      // updateHpc,
      // deleteHpc
   } = require('./controller')(db);

   // router.post(postHpc);
   router.get('/hpc', getHpc);
   // router.put(updateHpc);
   // router.delete(deleteHpc);

   return router;
}