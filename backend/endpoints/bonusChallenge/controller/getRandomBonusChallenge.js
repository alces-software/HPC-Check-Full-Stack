/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    return async (req, res) => {
        try {
            if (Math.random() >= 0.4) {
                return res.status(200).json({
                    success: true,
                    body: null
                });
            }
            const [bonusChallenge] = await db
                .collection('bonusChallenge')
                .aggregate([
                    {
                        $match: {
                            active: true
                        }
                    },
                    {
                        $sample: {
                            size: 1
                        }
                    }
                ])
                .toArray();



            if (!bonusChallenge) {
                return res.status(404).json({
                    success: false,
                    error: 'No active bonus challenges found'
                });
            }

            const { _id, ...rest } = bonusChallenge;

            return res.status(200).json({
                success: true,
                body: {
                    id: _id.toString(),
                    ...rest
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };
};