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
         const { title, expectedTime, description, clusterId, good, bad } = req.body || {};

         // Check title
         if (typeof title !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The title provided is not a string' });
         }

         if (!title) {
            return res.status(400).json({ success: false, error: 'Missing instruction title' });
         }

         const sanitizedTitle = String(title).trim();

         if (sanitizedTitle.length == 0) {
            return res.status(400).json({ success: false, error: 'The title provided is empty' });
         }

         // Check expected time
         if (typeof expectedTime !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The expected time provided is not a string' });
         }

         if (!expectedTime) {
            return res.status(400).json({ success: false, error: 'Missing expected time' });
         }

         const sanitizedExpectedTime = String(expectedTime).trim();

         if (sanitizedExpectedTime.length == 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The expected time provided is empty' });
         }

         // Check description
         if (typeof description !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The description provided is not a string' });
         }

         if (!description) {
            return res.status(400).json({ success: false, error: 'Missing description' });
         }

         const sanitizedDescription = String(description).trim();

         if (sanitizedDescription.length == 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The descriptions provided is empty' });
         }

         // Check cluster id
         if (typeof clusterId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is not a string' });
         }

         if (!clusterId) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         const sanitizedClusterId = String(clusterId).trim();

         if (sanitizedClusterId.length == 0) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(sanitizedClusterId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         // Check good
         if (typeof good !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The good provided is not a string' });
         }

         if (!good) {
            return res.status(400).json({ success: false, error: 'Missing instruction title' });
         }

         const sanitizedGood = String(good).trim();

         if (sanitizedGood.length == 0) {
            return res.status(400).json({ success: false, error: 'The good provided is empty' });
         }

         // Check bad
         if (typeof bad !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The bad provided is not a string' });
         }

         if (!bad) {
            return res.status(400).json({ success: false, error: 'Missing instruction title' });
         }

         const sanitizedBad = String(bad).trim();

         if (sanitizedBad.length == 0) {
            return res.status(400).json({ success: false, error: 'The bad provided is empty' });
         }

         // Get new instructions position
         const currentTotalInstructions = await db
            .collection('instruction')
            .countDocuments({ clusterId: sanitizedClusterId });

         // Check if cluster exists
         const clusterExists = await db.collection('cluster').findOne({
            _id: new ObjectId(sanitizedClusterId)
         });

         if (!clusterExists) {
            return res
               .status(404)
               .json({ success: false, error: 'The cluster specified does not exits' });
         }

         // Add to database
         await db.collection('instruction').insertOne({
            title: sanitizedTitle,
            expectedTime: sanitizedExpectedTime,
            description: sanitizedDescription,
            clusterId: sanitizedClusterId,
            good: sanitizedGood,
            bad: sanitizedBad,
            position: currentTotalInstructions + 1
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
