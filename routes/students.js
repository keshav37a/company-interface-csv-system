const express = require('express');
const router = express.Router();
const passport = require('passport');
const studentController = require('../controllers/student_controller');

router.get('/', studentController.home);
router.get('/new-student', studentController.newStudentRender);
router.post('/create-student', studentController.createStudentRequest);

module.exports = router;