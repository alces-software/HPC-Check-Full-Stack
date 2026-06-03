const { ObjectId } = require('mongodb');
const { dayFromIndex, indexFromDay, isValidDay } = require('../../enums/days');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllRota(req, res) {
      try {
         const results = await db.collection('schedule').find({}).toArray();
         const people = await db.collection('person').find({}).toArray();
         const clusters = await db.collection('cluster').find({}).toArray();

         let response = {
            mon: {},
            tue: {},
            wed: {},
            thu: {},
            fri: {}
         }

         results.forEach(d => {
            const dayName = dayFromIndex(d.dayIndex);
            const personName = people.find(i => i._id.toString() == d.personId).name;
            const clusterName = clusters.find(i => i._id.toString() == d.clusterId).name;

            if (Object.hasOwn(response[dayName], personName)) {
               response[dayName][personName].push(clusterName);
            } else {
               response[dayName] = {
                  [personName]: [clusterName]
               }
            }
         });

         res.status(200).json({ success: true, body: response });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getRotaByDay(req, res) {
      try {
         const { day } = req.params || {};

         if (day) {
            if (!isValidDay(rday)) {
               return res.status(400).json({ status: false, error: 'Invalid day provided' });
            }

            const results = await db.collection('schedule').find({
               dayIndex: indexFromDay(day)
            }).toArray();
            const people = await db.collection('person').find({}).toArray();
            const clusters = await db.collection('cluster').find({}).toArray();

            let response = [];

            results.forEach(d => {
               const personName = people.find(i => i._id.toString() == d.personId).name;
               const clusterName = clusters.find(i => i._id.toString() == d.clusterId).name;

               response.push({
                  person: personName,
                  cluster: clusterName,
                  dayIndex: i.dayIndex
               });
            });

            res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing day' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getRotaByCluster(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid cluster id provided" })
            }

            const results = await db.collection('schedule').find({
               clusterId: new ObjectId(id)
            }).toArray();
            const people = await db.collection('person').find({}).toArray();
            const clusters = await db.collection('cluster').find({}).toArray();

            let response = [];

            results.forEach(d => {
               const personName = people.find(i => i._id.toString() == d.personId).name;
               const clusterName = clusters.find(i => i._id.toString() == d.clusterId).name;

               response.push({
                  person: personName,
                  cluster: clusterName,
                  dayIndex: i.dayIndex
               });
            });

            res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getRotaByPerson(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid Person id provided" });
            }

            const results = await db.collection('schedule').find({
               personId: new ObjectId(id)
            }).toArray();
            const people = await db.collection('person').find({}).toArray();
            const clusters = await db.collection('cluster').find({}).toArray();

            let response = [];

            results.forEach(i => {
               const personName = people.find(data => data._id.toString() == i.personId).name;
               const clusterName = clusters.find(data => data._id.toString() == i.clusterId).name;

               response.push({
                  person: personName,
                  cluster: clusterName,
                  dayIndex: i.dayIndex
               });
            });

            res.status(200).json({ success: true, body: response });
         }

         res.status(400).json({ success: false, error: 'Missing person id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      getAllRota,
      getRotaByDay,
      getRotaByCluster,
      getRotaByPerson
   };
}