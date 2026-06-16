const { ObjectId } = require('mongodb');
const { dayFromIndex, indexFromDay, isValidDay } = require('../../enums/days');
const { generateSchedule } = require('../../services/cron/methods/schedule')

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

         const people = await db.collection('person').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         const cluster = await db.collection('cluster').find({}).toArray().then(res => {
            return res.map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         });

         let response = {
            mon: {},
            tue: {},
            wed: {},
            thu: {},
            fri: {}
         }

         results.forEach(d => {
            const dayName = dayFromIndex(d.dayIndex);
            const personName = people.find(i => i.id == d.personId).name;
            const clusterName = cluster.find(i => i.id == d.clusterId).name;

            if (Object.hasOwn(response[dayName], personName)) {
               response[dayName][personName].push(clusterName);
            } else {
               response[dayName][personName] = [clusterName];
            }
         });

         return res.status(200).json({ success: true, body: response });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
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
            if (!isValidDay(day)) {
               return res.status(400).json({ status: false, error: 'Invalid day provided' });
            }

            const results = await db.collection('schedule').find({
               dayIndex: indexFromDay(day)
            }).toArray();

            const people = await db.collection('person').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const cluster = await db.collection('cluster').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            let response = [];

            results.forEach(d => {
               response.push({
                  person: people.find(i => i.id == d.personId).name,
                  personId: d.personId,
                  cluster: cluster.find(i => i.id == d.clusterId).namerName,
                  clusterId: d.clusterId,
                  dayIndex: d.dayIndex
               });
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: 'Missing day' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
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
               clusterId: id
            }).toArray();

            const people = await db.collection('person').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const cluster = await db.collection('cluster').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            let response = [];

            results.forEach(d => {
               response.push({
                  person: people.find(i => i.id == d.personId).name,
                  personId: d.personId,
                  cluster: cluster.find(i => i.id == d.clusterId).name,
                  clusterId: d.clusterId,
                  dayIndex: d.dayIndex
               });
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: 'Missing cluster id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
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
               personId: id
            }).toArray();

            const people = await db.collection('person').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            const cluster = await db.collection('cluster').find({}).toArray().then(res => {
               return res.map(data => ({
                  id: data._id.toString(),
                  name: data.name
               }));
            });

            let response = [];

            results.forEach(d => {
               response.push({
                  person: people.find(i => i.id == d.personId).name,
                  personId: d.personId,
                  cluster: cluster.find(i => i.id == d.clusterId).name,
                  clusterId: d.clusterId,
                  dayIndex: d.dayIndex
               });
            });

            return res.status(200).json({ success: true, body: response });
         }

         return res.status(400).json({ success: false, error: 'Missing person id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function generateNewRota(req, res) {
      generateSchedule(db)
      return res.status(200).json({ success: true })
   }

   return {
      getAllRota,
      getRotaByDay,
      getRotaByCluster,
      getRotaByPerson,
      generateNewRota
   };
}