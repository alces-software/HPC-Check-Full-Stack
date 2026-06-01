/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const RotaController = require('./controller')(db);

   router.get('/rota', RotaController.getRota);
   router.put('/rota', RotaController.updateRota);

   return router;
}