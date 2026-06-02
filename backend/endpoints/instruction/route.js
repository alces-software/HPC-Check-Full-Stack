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

   router.get('/instructions/all/:clusterId', getAllInstructionsData);
   router.get('/instructions/:clusterId', getAllInstructionsOnly);
   router.get('/instructions/specific/all/:instructionId', getInstructionsAllById);
   router.get('/instructions/specific/:instructionId', getInstructionsOnlyById);

   return router;
}