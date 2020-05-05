const express = require('express');
const router = express.Router();
const passport = require('passport');
const studentController = require('../controllers/student_controller');

router.get('/', passport.checkAuthentication, studentController.home);
router.get('/:id/dropdown', passport.checkAuthentication, studentController.getDataForDropdown);
router.get('/new-student', passport.checkAuthentication, studentController.newStudentRender);
router.get('/:id/new-interview', passport.checkAuthentication, studentController.addInterviewToStudentRender);

router.post('/:id/add-interview', passport.checkAuthentication,studentController.addInterviewToStudentRequest);
router.post('/create-student', passport.checkAuthentication, studentController.createStudentRequest);

module.exports = router;