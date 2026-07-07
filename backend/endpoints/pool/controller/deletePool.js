const { ObjectId } = require('mongodb');

/**
 * @param {import('mongodb').Db} db
 */
module.exports = db => {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    return async (req, res) => {
        try {
            const { id } = req.body || {};

            // Check id
            if (!id) {
                return res.status(400).json({ success: false, error: 'Missing pool id' });
            }

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, error: 'Invalid pool id provided' });
            }

            // Check if pool exits
            const existingPerson = await db.collection('pool').findOne({
                _id: new ObjectId(id),
            });

            if (!existingPerson) {
                return res.status(409).json({
                    success: false,
                    error: "Pool doesn't exist",
                });
            }

            // Check if pool has clusters
            const hasClusters = await db.collection('cluster').findOne({
                poolId: id,
            });

            if (hasClusters) {
                return res
                    .status(409)
                    .json({ success: false, error: 'This pool has clusters assigned to it' });
            }

            // Check if pool is assigned to a team
            const isAssigned = await db.collection('teampool').findOne({
                poolId: id,
            });

            if (isAssigned) {
                return res
                    .status(409)
                    .json({ success: false, error: 'This pool is assigned to a team' });
            }

            // Delete the pool from the database
            await db.collection('pool').deleteOne({
                _id: new ObjectId(id),
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    };
};
