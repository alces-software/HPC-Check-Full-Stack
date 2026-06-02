require('dotenv').config();
const express = require('express');
const { startWeeklySchedule } = require('./services/cron/weekly-schedule');
const { Database } = require('./db/db');

(async () => {
   const app = express();
   app.use(express.json());

   // Connect to database
   const databaseConnection = await new Database(
      process.env.MONGO_URI,
      process.env.MONGO_DATABASE
   ).connect();

   console.log("Connected to database")

   // Register rota routes
   const rotaRoutes = require('./endpoints/rota/routes')(databaseConnection);
   app.use('/', rotaRoutes);

   // Register people routes
   const peopleRoutes = require('./endpoints/people/routes')(databaseConnection);
   app.use('/', peopleRoutes);

   // Register hpc routes
   const hpcRoutes = require('./endpoints/hpc/routes')(databaseConnection);
   app.use('/', hpcRoutes);

   // Start new weekly schedule cron job
   await startWeeklySchedule(databaseConnection);

   // Makes the app listen to the port
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();