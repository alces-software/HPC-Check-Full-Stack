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
            const { teamId } = req.body || {};
            const { id } = req.params || {};

            if (!id) {
                return res.status(400).json({ success: false, error: 'missing pool ID' });
            }

            if (!teamId) {
                return res.status(400).json({ success: false, error: 'missing team ID' });
            }

            const sanitizedId = String(id).trim();

            if (sanitizedId.length === 0) {
                return res
                    .status(400)
                    .json({ success: false, error: 'The pool id provided is empty' });
            }

            const sanitizedTeamId = String(teamId).trim();

            if (sanitizedTeamId.length === 0) {
                return res
                    .status(400)
                    .json({ success: false, error: 'The team id provided is empty' });
            }

            const poolResults = await db
                .collection('pool')
                .findOne({ _id: new ObjectId(sanitizedId) });

            if (!poolResults) {
                return res
                    .status(404)
                    .json({ success: false, error: 'Pool with that ID not found' });
            }

            const teamResults = await db
                .collection('team')
                .findOne({ _id: new ObjectId(sanitizedTeamId) });

            if (!teamResults) {
                return res
                    .status(404)
                    .json({ success: false, error: 'Team with that ID not found' });
            }

            const teamPoolResults = await db.collection('teampool').findOne({
                teamId: sanitizedTeamId,
                poolId: sanitizedId,
            });

            if (!teamPoolResults) {
                return res
                    .status(400)
                    .json({ success: false, error: 'Pool is not assigned to this team' });
            }

            await db.collection('teampool').deleteOne({
                teamId: sanitizedTeamId,
                poolId: sanitizedId,
            });

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    };
};
