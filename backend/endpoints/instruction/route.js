/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   const router = require('express').Router();
   const {
      getAllInstructionsData,
      getAllInstructionsOnly,
      getInstructionsAllById,
      getInstructionsOnlyById
   } = require('./controller')(db);

   router.get('/instructions/all/:id', getAllInstructionsData);
   router.get('/instructions/:id', getAllInstructionsOnly);
   router.get('/instructions/specific/all/:id', getInstructionsAllById);
   router.get('/instructions/specific/:id', getInstructionsOnlyById);

   return router;
}