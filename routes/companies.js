const express = require('express');
const router = express.Router();
const passport = require('passport');
const companyController = require('../controllers/company_controller');

router.get('/', companyController.home);
router.get('/new-company', companyController.newcompanyRender);
router.post('/create-company', companyController.createcompanyRequest);

module.exports = router;