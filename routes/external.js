const express = require('express');
const router = express.Router();
const passport = require('passport');
const externalController = require('../controllers/external_controller');

router.get('/github', passport.checkAuthentication, externalController.github);

module.exports = router;