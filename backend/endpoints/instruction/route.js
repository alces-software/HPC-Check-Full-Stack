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

   router.get('/instruction/all/:id', getAllInstructionsData);
   router.get('/instruction/:id', getAllInstructionsOnly);
   router.get('/instruction/specific/all/:id', getInstructionsAllById);
   router.get('/instruction/specific/:id', getInstructionsOnlyById);

   return router;
}