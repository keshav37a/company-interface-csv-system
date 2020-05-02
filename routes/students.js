const express = require('express');
const router = express.Router();
const passport = require('passport');
const studentController = require('../controllers/student_controller');

router.get('/', studentController.home);

module.exports = router;