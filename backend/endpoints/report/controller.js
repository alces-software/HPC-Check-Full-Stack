const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
   /**
    * @param {import('express').Request} req
    * @param {import('express').Response} res
    * @returns {Promise<void>}
    */
    async function getReportById(req, res) {
        try {
            const { id } = req.params || {}
            if (!id) {
                return res.status(400).json({ success: false, error: 'Missing id' })
            }

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, error: 'Invalid report id' })
            }

            const report = await db.collection('report').findOne({
                _id: new ObjectId(id)
            });

            if (!report) {
                return res.status(404).json({ success: false, error: "Report doesn't exist" })
            }

            if (!report.clusterId || !ObjectId.isValid(report.clusterId)) {
                return res.status(500).json({ success: false, error: 'Report cluster reference is invalid' })
            }

            if (!report.personId || !ObjectId.isValid(report.personId)) {
                return res.status(500).json({ success: false, error: 'Report person reference is invalid' })
            }

            const cluster = await db.collection('cluster').findOne({
                _id: new ObjectId(report.clusterId)
            })
            if (!cluster) {
                return res.status(404).json({ success: false, error: 'Cluster referenced by report not found' })
            }

            const person = await db.collection('person').findOne({
                _id: new ObjectId(report.personId)
            })
            if (!person) {
                return res.status(404).json({ success: false, error: 'Person referenced by report not found' })
            }

            const results = await db.collection('result').find({
                reportId: id
            }).toArray()

            const resultObjects = results.map((result) => ({
                instructionId: result.instructionId,
                passed: result.passed,
                note: result.note
            }))

            return res.status(200).json({
                success: true,
                body: {
                    id,
                    cluster: cluster.name,
                    person: person.name,
                    startTime: report.startDate,
                    endTime: report.endDate,
                    results: resultObjects
                }
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
    return {getReportById}
}