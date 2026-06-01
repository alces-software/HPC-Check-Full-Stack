const { MongoClient, Db } = require("mongodb");

module.exports.Database = class {
   constructor() {
      /**
       * @type {MongoClient}
       */
      this.client = new MongoClient(
         process.env.MONGO_URI, {
         maxPoolSize: 10
      });
      /**
       * @type {Db}
       */
      this.db = null;
   }

   /**
    * Connects to the mongodb
    * @returns {Promise<Db>}
    */
   async connect() {
      if (!this.db) {
         await this.client.connect();
         this.db = this.client.db(process.env.MONGO_DATABASE_NAME);
      }
      return this.db;
   }
}