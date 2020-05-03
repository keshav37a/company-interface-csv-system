const express = require('express');
const router = express.Router();
const passport = require('passport');
const companyController = require('../controllers/company_controller');

router.get('/', passport.checkAuthentication, companyController.home);
router.get('/new-company', passport.checkAuthentication, companyController.newcompanyRender);
router.post('/create-company', passport.checkAuthentication, companyController.createcompanyRequest);

module.exports = router;