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
         const { id, ...rest } = req.body || {};

         // Check id
         if (typeof id !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The instruction provided is not a string' });
         }

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing instruction id' });
         }

         const sanitizedId = String(id).trim();

         if (sanitizedId.length == 0) {
            return res.status(400).json({ success: false, error: 'The id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedId)) {
            return res.status(400).json({ success: false, error: 'The id provided is invalid' });
         }

         // Check updates
         const updates = Object.fromEntries(
            Object.entries(rest)
               .filter(([k, v]) => v != null && k != '_id')
               .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
         );

         if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid fields to update' });
         }

         // Check instruction exists
         const instructionExists = await db
            .collection('instruction')
            .findOne({ _id: new ObjectId(sanitizedId) });
         if (!instructionExists) {
            return res
               .status(404)
               .json({ success: false, error: 'No instruction with that id exists' });
         }

         // Check position if provided and update instructions around it
         if (updates.position != null) {
            let instructions = await db
               .collection('instruction')
               .find({ clusterId: instructionExists.clusterId })
               .toArray()
               .then((res) => res.sort((a, b) => a.position - b.position));

            const instructionCount = instructions.length;

            if (updates.position < 1 || updates.position > instructionCount) {
               return res
                  .status(400)
                  .json({ success: false, error: 'The new instruction position is invalid' });
            }

            instructions = instructions.filter((i) => !i._id.equals(new ObjectId(id)));
            instructions.splice(updates.position - 1, 0, instructionExists);

            await db.collection('instruction').bulkWrite(
               instructions.map((i, index) => ({
                  updateOne: {
                     filter: { _id: i._id },
                     update: {
                        $set: { position: index + 1 },
                     },
                  },
               })),
            );
         }

         if (updates.length > 0) {
            // Do not remove this if the database validation will fail
            await db
               .collection('instruction')
               .updateOne({ _id: new ObjectId(sanitizedId) }, { $set: updates });
         }

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
