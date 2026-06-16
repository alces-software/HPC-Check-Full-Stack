require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startWeeklySchedule } = require('./services/cron/weekly-schedule');
const { generateSchedule } = require('./services/cron/methods/schedule');
const { Database } = require('./db/db');
const { seedData } = require('./scripts/testData');

(async () => {
   const app = express();

   app.use(cors());
   app.use(express.json());

   // Connect to database
   const databaseObject = new Database(
      process.env.MONGO_URI,
      process.env.MONGO_DATABASE
   );

   let databaseConnection = await databaseObject.connect();
   if (!await databaseObject.validate()) {
      await databaseObject.generateDb();
      await seedData(databaseConnection);
      await generateSchedule(databaseConnection);
   }

   console.log("Connected to database");

   // Register rota routes
   const rotaRoutes = require('./endpoints/rota/routes')(databaseConnection);
   app.use('/', rotaRoutes);

   // Register people routes
   const peopleRoutes = require('./endpoints/people/routes')(databaseConnection);
   app.use('/', peopleRoutes);

   // Register hpc routes
   const hpcRoutes = require('./endpoints/hpc/routes')(databaseConnection);
   app.use('/', hpcRoutes);

   // Register instruction routes
   const instructionRoutes = require('./endpoints/instruction/route')(databaseConnection);
   app.use('/', instructionRoutes);

   // Register report routes
   const reportRoutes = require('./endpoints/report/routes')(databaseConnection);
   app.use('/', reportRoutes);

   // Register method routes
   const methodRoutes = require('./endpoints/method/route')(databaseConnection);
   app.use('/', methodRoutes);

   // Register team routes
   const teamRoutes = require('./endpoints/team/routes')(databaseConnection);
   app.use('/', teamRoutes);

   // Start new weekly schedule cron job
   startWeeklySchedule(databaseConnection);

   // Makes the app listen to the port
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();