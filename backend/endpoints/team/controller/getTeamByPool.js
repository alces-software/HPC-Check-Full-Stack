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
         const { id } = req.params || {};

         // Check id
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing pool id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length === 0) {
            return res.status(400).json({ success: false, error: 'The pool id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'Invalid pool id provided' });
         }

         const poolResults = await db.collection('pool').findOne({
            _id: new ObjectId(sanitizedId)
         });

         if (!poolResults) {
            return res.status(404).json({ success: false, error: "Pool doesn't exist" });
         }

         // Get the teamPool
         const results = await db.collection('teampool').find({ poolId: sanitizedId }).toArray();

         if (results.length === 0) {
            return res.status(404).json({ success: false, error: 'Pool does not have any teams' });
         }

         const formattedResponse = results.map((result) => ({
            poolId: sanitizedId,
            teamId: result.teamId
         }));

         // Return the team information
         return res.status(200).json({
            success: true,
            body: formattedResponse
         });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
