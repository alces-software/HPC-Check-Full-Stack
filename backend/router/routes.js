const router = require('express').Router();
const RouterController = require('./controller');
router.get('/router', RouterController.register)