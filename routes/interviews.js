const express = require('express');
const router = express.Router();
const passport = require('passport');
const interviewController = require('../controllers/interview_controller');

router.get('/', passport.checkAuthentication, interviewController.home);
router.get('/new-interview', passport.checkAuthentication, interviewController.newInterviewRender);
router.post('/create-interview', passport.checkAuthentication, interviewController.createInterviewRequest);

module.exports = router;