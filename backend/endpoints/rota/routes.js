/**
 * @param {import('mongodb').Db} db
 */
module.exports = async (db) => {
   return (
      require('express')
         .Router()
         //GET
         .get('/rota', require('./controller/getAllRota')(db))
         .get('/rota/person/:id', require('./controller/getRotaByPerson')(db))
         .get('/rota/week/:date', require('./controller/getRotaByWeek')(db))
         //POST
         .post('/rota/override', require('./controller/addOverride')(db))
         .post('/rota/closed', require('./controller/addClosedDay')(db))
   );
};
