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
   async function addPeople(req, res) {
      try {
         const { name } = req.body || {};

         if (name) {
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const existingPerson = await db.collection('person').findOne({
               name: sanitizedName
            });

            if (existingPerson) {
               return res.status(409).json({ success: false, error: 'Person already exits' });
            }

            await db.collection('person').insertOne({
               name: sanitizedName
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing persons name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllPeople(req, res) {
      try {
         const response = await db.collection('person').find({}).toArray().then(results => {
            return results.map(data => ({
               id: data._id.toString(),
               name: data.name,
               teamId: data.teamId
            }));
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
   async function getPeopleById(req, res) {
      try {
         const { id } = req.params || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
            }

            const results = await db.collection('person').findOne({
               _id: new ObjectId(id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Person doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: id,
                  name: results.name,
                  teamId: results.teamId
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing persons id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getPeopleByName(req, res) {
      try {
         const { name } = req.params || {};

         if (name) {
            const sanitizedName = String(name).trim();

            if (sanitizedName.length == 0) {
               return res.status(400).json({ success: false, error: "The name provided is empty" });
            }

            const results = await db.collection('person').findOne({
               name: { $regex: `^${sanitizedName}$`, $options: "i" }
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Person doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: results._id.toString(),
                  name: results.name,
                  teamId: results.teamId
               }
            });
         }

         return res.status(400).json({ success: false, error: 'Missing persons name' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deletePeople(req, res) {
      try {
         const { id } = req.body || {};

         if (id) {
            if (!ObjectId.isValid(id)) {
               return res.status(400).json({ success: false, error: "Invalid person id provided" });
            }

            const existingPerson = await db.collection('person').findOne({
               _id: new ObjectId(id)
            });

            if (!existingPerson) {
               return res.status(409).json({
                  success: false, error: 'Person doesn\'t exists'
               });
            }

            const hasReports = await db.collection('report').find({
               personId: id
            }).toArray();

            if (hasReports.length > 0) {
               return res.status(409).json({ success: false, error: "This person has reports" });
            }

            await db.collection('person').deleteOne({
               _id: new ObjectId(id)
            });

            return res.status(200).json({ success: true });
         }

         return res.status(400).json({ success: false, error: 'Missing persons id' });
      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function assignToTeam(req, res) {
      try {
         const { id } = req.params || {};
         const { teamId } = req.body || {}
         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing person\'s id' });
         }

         if (!teamId) {
            return res.status(400).json({ success: false, error: 'Missing team\'s id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid person id provided" });
         }

         const person = await db.collection('person').findOne({
            _id: new ObjectId(id)
         });

         if (!person) {
            return res.status(404).json({ success: false, error: "Person doesn't exist" });
         }

         const teamExists = await db.collection('team').findOne({
            _id: new ObjectId(teamId)
         });

         if (!teamExists) {
            return res.status(404).json({ success: false, error: "Team doesn't exist" });
         }

         db.collection('person').updateOne(
            { _id: new ObjectId(id) },
            { $set: {teamId: teamId} }
         );

         return res.status(200).json({ success: true });

      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getPeopleByTeam(req, res) {
      try {
         const { id } = req.params || {};

         if (!id) {
            return res.status(400).json({ success: false, error: 'Missing team id' });
         }

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid team id provided" });
         }

         const results = await db.collection('person').find({
            teamId: id
         });

         const data = await results.toArray().then(results => results.map((result) => {
            result._id = result._id.toString();
            return result;
         }))

         return res.status(200).json({
            success: true, body: data
         });

      } catch (error) {
         return res.status(500).json({ success: false, error: error.message });
      }
   }

   return {
      addPeople,
      getAllPeople,
      getPeopleById,
      getPeopleByName,
      getPeopleByTeam,
      deletePeople,
      assignToTeam
   };
}