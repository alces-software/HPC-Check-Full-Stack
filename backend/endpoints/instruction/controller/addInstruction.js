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
         const {
            title: rawTitle,
            expectedTime: rawExpectedTime,
            description: rawDescription,
            clusterId: rawClusterId,
            good: rawGood,
            bad: rawBad
         } = req.body || {};

         console.log(req.body);

         // Check title
         if (rawTitle === undefined || rawTitle === null) {
            return res.status(400).json({ success: false, error: 'Missing instruction title' });
         }

         if (typeof rawTitle !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The title provided is not a string' });
         }

         const title = rawTitle.trim();

         if (!title) {
            return res.status(400).json({ success: false, error: 'The title provided is empty' });
         }

         // Check expected time
         if (rawExpectedTime === undefined || rawExpectedTime === null) {
            return res.status(400).json({ success: false, error: 'Missing expected time' });
         }

         if (typeof rawExpectedTime !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The expected time provided is not a string' });
         }

         const expectedTime = rawExpectedTime.trim();

         if (!expectedTime) {
            return res
               .status(400)
               .json({ success: false, error: 'The expected time provided is empty' });
         }

         // Check description
         if (rawDescription === undefined || rawDescription === null) {
            return res.status(400).json({ success: false, error: 'Missing description' });
         }

         if (typeof rawDescription !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The description provided is not a string' });
         }

         const description = rawDescription.trim();

         if (!description) {
            return res
               .status(400)
               .json({ success: false, error: 'The descriptions provided is empty' });
         }

         // Check cluster id
         if (rawClusterId === undefined || rawClusterId === null) {
            return res.status(400).json({ success: false, error: 'Missing cluster id' });
         }

         if (typeof rawClusterId !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is not a string' });
         }

         const clusterId = rawClusterId.trim();

         if (!clusterId) {
            return res
               .status(400)
               .json({ success: false, error: 'The cluster id provided is empty' });
         }

         if (!ObjectId.isValid(clusterId)) {
            return res.status(400).json({ success: false, error: 'Invalid cluster id provided' });
         }

         // Check good
         if (rawGood === undefined || rawGood === null) {
            return res.status(400).json({ success: false, error: 'Missing good' });
         }

         if (typeof rawGood !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The good provided is not a string' });
         }

         const good = rawGood.trim();

         if (!good) {
            return res.status(400).json({ success: false, error: 'The good provided is empty' });
         }

         // Check bad
         if (rawBad === undefined || rawBad === null) {
            return res.status(400).json({ success: false, error: 'Missing bad' });
         }

         if (typeof rawBad !== 'string') {
            return res
               .status(400)
               .json({ success: false, error: 'The bad provided is not a string' });
         }

         const bad = rawBad.trim();

         if (bad.length == 0) {
            return res.status(400).json({ success: false, error: 'The bad provided is empty' });
         }

         // Get cluster
         const cluster = await db.collection('cluster').findOne({
            _id: new ObjectId(clusterId)
         });

         if (!cluster) {
            return res
               .status(404)
               .json({ success: false, error: 'The cluster specified does not exits' });
         }

         // Add to database
         await db.collection('instruction').insertOne({
            title: title,
            expectedTime: expectedTime,
            description: description,
            clusterId: clusterId,
            good: good,
            bad: bad,
            position:
               (await db.collection('instruction').countDocuments({ clusterId: clusterId })) + 1
         });

         return res.status(200).json({ success: true });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
