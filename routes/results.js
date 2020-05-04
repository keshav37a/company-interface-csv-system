const express = require('express');
const router = express.Router();
const passport = require('passport');
const resultController = require('../controllers/result_controller');

router.get('/', passport.checkAuthentication, resultController.home);
router.get('/new-result', passport.checkAuthentication, resultController.newResultRender);
router.get('/export-csv', passport.checkAuthentication, resultController.exportToCsv);

router.post('/create-result', passport.checkAuthentication, resultController.createResultRequest);


module.exports = router;