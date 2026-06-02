/**
 * @param {import('mongodb').Db} db
 */
module.exports = (db) => {
    const router = require('express').Router();
    const {
        getReportById
    } = require('./controller')(db);

    router.get('/report/id/:id', getReportById);

    return router;
}