/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * Handles the get request for the rota endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getRota(req, res) {
      try {
         const days = await db.collection('schedule').find({}).toArray();
         const people = await db.collection('person').find({}).toArray();
         const clusters = await db.collection('cluster').find({}).toArray();

         let response = {
            mon: {},
            tue: {},
            wed: {},
            thu: {},
            fri: {}
         }

         const dayNames = Object.keys(response);

         days.forEach((day) => {
            const dayName = dayNames[day.dayIndex];
            const personName = people.find(data => data._id.toString() == day.personId).name;
            const clusterName = clusters.find(data => data._id.toString() == day.clusterId).name;

            if (Object.hasOwn(response[dayName], personName)) {
               response[dayName][personName].push(clusterName)
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

   return {
      getRota
   };
}