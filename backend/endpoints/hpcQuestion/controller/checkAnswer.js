const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   return async (req, res) => {
      try {
         const { questionId, selectedAnswerIndex, optionOrder } = req.body || {};

         if (!questionId) {
            return res.status(400).json({
               success: false,
               error: 'Missing question id'
            });
         }

         const sanitizedQuestionId = String(questionId).trim();

         if (!ObjectId.isValid(sanitizedQuestionId)) {
            return res.status(400).json({
               success: false,
               error: 'Invalid question id'
            });
         }

         if (!Number.isInteger(selectedAnswerIndex)) {
            return res.status(400).json({
               success: false,
               error: 'Selected answer index must be an integer'
            });
         }

         if (!Array.isArray(optionOrder)) {
            return res.status(400).json({
               success: false,
               error: 'Option order must be an array'
            });
         }

         if (!optionOrder.every((value) => Number.isInteger(value))) {
            return res.status(400).json({
               success: false,
               error: 'Option order must only contain integers'
            });
         }

         const question = await db.collection('hpcQuestion').findOne({
            _id: new ObjectId(sanitizedQuestionId),
            active: true
         });

         if (!question) {
            return res.status(404).json({
               success: false,
               error: 'HPC question does not exist'
            });
         }

         if (selectedAnswerIndex < 0 || selectedAnswerIndex >= optionOrder.length) {
            return res.status(400).json({
               success: false,
               error: 'Selected answer index is out of range'
            });
         }

         if (optionOrder.length !== question.options.length) {
            return res.status(400).json({
               success: false,
               error: 'Option order length does not match question options'
            });
         }

         const originalSelectedAnswerIndex = optionOrder[selectedAnswerIndex];

         if (
            originalSelectedAnswerIndex < 0 ||
            originalSelectedAnswerIndex >= question.options.length
         ) {
            return res.status(400).json({
               success: false,
               error: 'Original selected answer index is out of range'
            });
         }

         const correct = originalSelectedAnswerIndex === question.correctAnswerIndex;

         const correctAnswerDisplayIndex = optionOrder.findIndex(
            (originalIndex) => originalIndex === question.correctAnswerIndex
         );

         return res.status(200).json({
            success: true,
            body: {
               correct,
               correctAnswerIndex: correctAnswerDisplayIndex,
               explanation: question.explanation
            }
         });
      } catch (error) {
         return res.status(500).json({
            success: false,
            error: error.message
         });
      }
   };
};