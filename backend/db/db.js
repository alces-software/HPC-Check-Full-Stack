const { MongoClient, Db } = require("mongodb");

module.exports.Database = class {
   constructor(uri, dbName) {
      /**
       * @type {MongoClient}
       */
      this.client = new MongoClient(uri, {
         maxPoolSize: 10,
      });

      /**
       * @type {String}
       */
      this.dbName = dbName;

      /**
       * @type {Db | null}
       */
      this.db = null;

      /**
       * @type {Promise<Db> | null}
       */
      this.connectPromise = null;
   }

   /**
    * Connects to MongoDB
    * @returns {Promise<Db>}
    */
   async connect() {
      if (this.db) return this.db;

      if (!this.connectPromise) {
         this.connectPromise = (async () => {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            return this.db;
         })();
      }

      return this.connectPromise;
   }
};