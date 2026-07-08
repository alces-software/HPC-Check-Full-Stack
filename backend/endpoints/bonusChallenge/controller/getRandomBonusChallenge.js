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
         // Check to see if the user gets a bonus question
         if (Math.random() >= 0.4) {
            return res.status(200).json({ success: true });
         }

         // Get a random bonus question from the database
         const response = await db
            .collection('bonusChallenge')
            .aggregate([
               {
                  $match: {
                     active: true
                  }
               },
               {
                  $sample: {
                     size: 1
                  }
               }
            ])
            .toArray()
            .then((res) =>
               res.map(({ _id, ...rest }) => ({
                  id: _id.toString(),
                  ...rest
               }))
            );

         // Check if a bonus question was chosen
         if (!response) {
            return res
               .status(404)
               .json({ success: false, error: 'No active bonus challenges found' });
         }

         return res.status(200).json({ success: true, body: response[0] });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
