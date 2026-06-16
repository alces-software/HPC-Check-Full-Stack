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
   async function getTeams(req, res) {
        try {
            const response = await db.collection('team').find({}).toArray().then(results => {
            return results.map(data => ({
                id: data._id.toString(),
                name: data.name
            }));
            });

            return res.status(200).json({ success: true, body: response });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getTeamsById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid team id provided" });
            }

            const results = await db.collection('team').findOne({
               _id: new ObjectId(id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Team doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: id,
                  name: results.name
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing teams id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getTeamsByName(req, res) {
      try {
         const { name } = req.params || {};

         if (name) {
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const results = await db.collection('team').findOne({
               name: { $regex: `^${sanitizedName}$`, $options: "i" }
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Team doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: results._id.toString(),
                  name: results.name
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing teams name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deleteTeam(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid team id provided" });
            }

            const existingPerson = await db.collection('team').findOne({
               _id: new ObjectId(id)
            });

            if (!existingPerson) {
               return res.status(409).json({
                  success: false, error: 'Team doesn\'t exists'
               });
            }

            const hasPeople = await db.collection('person').find({
               teamId: id
            }).toArray();

            if (hasPeople.length > 0) {
               return res.status(409).json({ success: false, error: "This team has people" });
            }

            const hasClusters = await db.collection('cluster').find({
               teamId: id
            }).toArray();

            if (hasClusters.length > 0) {
               return res.status(409).json({ success: false, error: "This team has clusters" });
            }

            await db.collection('team').deleteOne({
               _id: new ObjectId(id)
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing team\'s id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function addTeam(req, res) {
      try {
         const { name } = req.body || {};

         if (name) {
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const existingTeam = await db.collection('team').findOne({
               name: sanitizedName
            });

            if (existingTeam) {
               return res.status(409).json({ success: false, error: 'Team already exits' });
            }

            await db.collection('team').insertOne({
               name: sanitizedName
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing team\'s name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   return {
    getTeams,
    getTeamsById,
    getTeamsByName,
    deleteTeam,
    addTeam
   }
}