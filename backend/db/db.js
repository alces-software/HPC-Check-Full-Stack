const { MongoClient, Db } = require("mongodb");
const fs = require('fs');

module.exports.Database = class {
   constructor(uri, dbName) {
      /**
       * @type {MongoClient}
       */
      this.client = new MongoClient(uri);

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

            const db = this.client.db(this.dbName);

            this.db = db;
            return this.db;
         })();
      }

      return this.connectPromise;
   }

   async validate() {
      const admin = this.db.admin();
      const { databases } = await admin.listDatabases();

      const exists = databases.some(
         database => database.name === this.dbName
      );

      return exists;
   }

   async exportDb() {

      const collections = await this.db.listCollections().toArray();

      const exportData = collections.map(collection => ({
         name: collection.name,
         validator: collection.options?.validator || null,
         validationLevel: collection.options?.validationLevel || null,
         validationAction: collection.options?.validationAction || null
      }));

      fs.writeFileSync(
         'mongodb-schema.json',
         JSON.stringify(exportData, null, 2)
      );
   }

   async generateDb() {
      const schema = JSON.parse(
         fs.readFileSync('mongodb-schema.json', 'utf8')
      );

      const db = await this.connect();

      for (const collectionDef of schema) {
         const exists = await db
            .listCollections({ name: collectionDef.name })
            .hasNext();

         if (exists) {
            console.log(`Collection "${collectionDef.name}" already exists`);
            continue;
         }

         await db.createCollection(collectionDef.name, {
            validator: collectionDef.validator ?? undefined,
            validationLevel: collectionDef.validationLevel ?? undefined,
            validationAction: collectionDef.validationAction ?? undefined
         });

         console.log(`Created collection "${collectionDef.name}"`);
      }
   }
};