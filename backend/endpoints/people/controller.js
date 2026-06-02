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
         if (req.body.name) {
            const existingPerson = await db.collection('person').findOne({
               name: req.body.name
            });

            if (existingPerson) {
               return res.status(409).json({ success: false, error: 'Person already exits' });
            }

            db.collection('person').insertOne({
               name: req.body.name
            });
         } else {
            return res.status(400).json({ success: false, error: 'Missing persons name' });
         }

         res.status(200).json({ success: true });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getAllPeople(req, res) {
      try {
         const response = (await db.collection('person').find({}).toArray()).map(data => ({
            id: data._id.toString(),
            name: data.name
         }));

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
   async function getPeopleById(req, res) {
      try {
         if (req.params.id) {
            const results = await db.collection('person').findOne({
               _id: new ObjectId(req.params.id)
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Person doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: req.params.id,
                  name: results.name
               }
            });
         }

         res.status(400).json({ success: false, error: 'Missing persons id' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getPeopleByName(req, res) {
      try {
         if (req.params.name) {
            const results = await db.collection('person').findOne({
               name: { $regex: `^${req.params.name}$`, $options: "i" }
            });

            if (!results) {
               return res.status(404).json({ success: false, error: "Person doesn't exist" });
            }

            return res.status(200).json({
               success: true, body: {
                  id: results._id.toString(),
                  name: results.name
               }
            });
         }
         
         res.status(400).json({ success: false, error: 'Missing persons name' });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   }

   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function deletePeople(req, res) {
      try {
         if (req.body.id) {
            const existingPerson = await db.collection('person').findOne({
               _id: new ObjectId(req.body.id)
            });

            if (!existingPerson) {
               return res.status(409).json({
                  success: false, error: 'Person doesn\'t exists'
               });
            }

            db.collection('person').deleteOne({
               _id: new ObjectId(req.body.id)
            });
         } else {
            return res.status(400).json({ success: false, error: 'Missing persons id' });
         }

         res.status(200).json({ success: true });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   return {
      addPeople,
      getAllPeople,
      getPeopleById,
      getPeopleByName,
      deletePeople
   };
}