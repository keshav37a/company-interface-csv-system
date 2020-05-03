const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/user_controller');

router.get('/', userController.user);
router.get('/sign-in', userController.signInRender);
router.get('/sign-up', userController.signUpRender);
router.get('/sign-out', userController.destroySessionRequest);

router.post('/create-user',  userController.createUserRequest);
router.post('/create-session', passport.authenticate('local',{failureRedirect: '/users/sign-in'},), userController.createSessionRequest);

module.exports = router;