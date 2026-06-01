(async () => {
   require('dotenv').config();
   const express = require('express');
   const app = express();
   app.use(express.json());

   // Connect to database
   const { Database } = require('./db/database');
   const databaseConnection = await new Database().connect();

   // Register rota
   const rotaRoutes = require('./endpoints/rota/routes')(databaseConnection);
   app.use('/', rotaRoutes);

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})()