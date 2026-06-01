require('dotenv').config();
const express = require('express');
const { Database } = require('./db/db');

(async () => {
   const app = express();
   app.use(express.json());

   // Connect to database
   const databaseConnection = await new Database(
      process.env.MONGO_URI,
      process.env.MONGO_DATABASE
   ).connect();

   // Register rota routes
   const rotaRoutes = require('./endpoints/rota/routes')(databaseConnection);
   app.use('/', rotaRoutes);

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})()