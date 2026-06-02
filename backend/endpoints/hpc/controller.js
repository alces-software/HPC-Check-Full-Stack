const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   // /**
   //  * Handles the post request for the HPC endpoint
   //  * @param {import('express').Request} req
   //  * @param {import('express').Response} res
   //  * @returns {Promise<void>}
   //  */
   // async function postHpc(req, res) {
   //    res.status(500).json({ success: false, error: 'Not implemented' });
   // };

   /**
    * Handles the get request for the Hpc endpoint
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
   async function getHpc(req, res) {
      try {
         let response;

         if (req.params.id) {
            const results = await db.collection('cluster').findOne({
               _id: new ObjectId(req.params.id)
            });

            response = {
               id: req.params.id,
               name: results.name
            }
         } else {
            response = (await db.collection('cluster').find({}).toArray()).map(data => ({
               id: data._id.toString(),
               name: data.name
            }));
         }

         res.status(200).json({ success: true, body: response });
      } catch (error) {
         res.status(500).json({ success: false, error: error.message });
      }
   };

   // /**
   //  * Handles the put request for the Hpc endpoint
   //  * @param {import('express').Request} req
   //  * @param {import('express').Response} res
   //  * @returns {Promise<void>}
   //  */
   // async function updateHpc(req, res) {
   //    res.status(500).json({ success: false, error: 'Not implemented' });
   // };

   // /**
   //  * Handles the delete request for the Hpc endpoint
   //  * @param {import('express').Request} req
   //  * @param {import('express').Response} res
   //  * @returns {Promise<void>}
   //  */
   // async function deleteHpc(req, res) {
   //    res.status(500).json({ success: false, error: 'Not implemented' });
   // };

   return {
      // postHpc,
      getHpc,
      // updateHpc,
      // deleteHpc
   };
}