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
   app.use('/', require('./endpoints/rota/routes')(databaseConnection));

   // Register people routes
   app.use('/', require('./endpoints/people/routes')(databaseConnection));

   // Register hpc routes
   app.use('/', require('./endpoints/hpc/routes')(databaseConnection));

   // Register instruction routes
   app.use('/', require('./endpoints/instruction/route')(databaseConnection));

   // Register report routes
   app.use('/', require('./endpoints/report/routes')(databaseConnection));

   // Register method routes
   app.use('/', require('./endpoints/method/route')(databaseConnection));

   // Register team routes
   app.use('/', require('./endpoints/team/routes')(databaseConnection));

   // Start new weekly schedule cron job
   startWeeklySchedule(databaseConnection);

   // Makes the app listen to the port
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();