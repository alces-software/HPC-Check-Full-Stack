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
         if (Math.random() >= 0.35) {
            return res.status(200).json({
               success: true,
               body: null
            });
         }

         const [question] = await db
            .collection('hpcQuestion')
            .aggregate([{ $match: { active: true } }, { $sample: { size: 1 } }])
            .toArray();

         if (!question) {
            return res.status(404).json({
               success: false,
               error: 'No active HPC questions found'
            });
         }

         const optionOrder = question.options.map((_, index) => index);

         for (let i = optionOrder.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const temporaryValue = optionOrder[i];

            optionOrder[i] = optionOrder[randomIndex];
            optionOrder[randomIndex] = temporaryValue;
         }

         const shuffledOptions = optionOrder.map(
            (originalIndex) => question.options[originalIndex]
         );

         return res.status(200).json({
            success: true,
            body: {
               id: question._id.toString(),
               question: question.question,
               options: shuffledOptions,
               optionOrder
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
