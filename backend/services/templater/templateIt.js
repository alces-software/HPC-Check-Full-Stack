const fs = require('fs/promises');
const path = require('path');

/**
 * Adds a basic template to the HPC cluster so it has generic instructions and methods
 * @param {String} clusterId
 * @param {import('mongodb').Db} db
 */
module.exports.templateIt = async (clusterId, db) => {
   const templateData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'templateInfo.json'), 'utf8')
   );

   for (const instruction of templateData.instructions) {
      const result = await db.collection('instruction').insertOne({
         title: instruction.title,
         expectedTime: instruction.expectedTime,
         description: instruction.description,
         clusterId,
         good: instruction.good,
         bad: instruction.bad
      });

      const instructionId = result.insertedId.toString();

      for (const method of instruction.methods) {
         await db.collection('method').insertOne({
            content: method.content,
            instructionId
         });
      }
   }
}