require('dotenv').config();
const { ObjectId } = require('mongodb');
const { getDaily } = require('../scheduleLogic');

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
         const { personId, date, newPersonId } = req.body || {};

         if (!personId || !date || !newPersonId) {
            return res.status(400).json({ success: false, error: 'Malformed request' });
         }

         if (!ObjectId.isValid(personId) || !ObjectId.isValid(newPersonId)) {
            return res.status(400).json({ success: false, error: 'Invalid person id' });
         }

         const overrideDate = new Date(date);
         overrideDate.setUTCHours(0, 0, 0, 0);
         if (Number.isNaN(overrideDate.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid date' });
         }

         const person = await db.collection('person').findOne({ _id: new ObjectId(personId) });
         const newPerson = await db
            .collection('person')
            .findOne({ _id: new ObjectId(newPersonId) });

         if (!person || !newPerson) {
            return res
               .status(404)
               .json({ success: false, error: 'Person or replacement not found' });
         }

         if (person.teamId !== newPerson.teamId) {
            return res
               .status(400)
               .json({ success: false, error: 'Replacement person must be in the same team' });
         }

         const overrides = db.collection('scheduleOverride');

         const existingOverride = await overrides.findOne({
            date: overrideDate,
            newPersonId: personId
         });

         const originalPersonId = existingOverride ? existingOverride.personId : personId;

         const scheduleOnDate = await getDaily(db, overrideDate);

         if (!(personId in scheduleOnDate)) {
            return res.status(404).json({
               success: false,
               error: 'Person is not scheduled on that date'
            });
         }

         await overrides.deleteMany({
            date: overrideDate,
            $or: [
               { personId: originalPersonId },
               { newPersonId: originalPersonId },
               { personId: newPersonId },
               { newPersonId: newPersonId }
            ]
         });

         const overrideDoc = {
            personId: originalPersonId,
            newPersonId,
            date: overrideDate
         };

         await overrides.insertOne(overrideDoc);

         return res.status(200).json({ success: true, body: overrideDoc });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };
};
