const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

router.get('/', userController.user);
router.get('/sign-in', userController.signInRender);
router.get('/sign-up', userController.signUpRender);

router.post('/create-user',  userController.createUserRequest);
router.post('/create-session',  userController.createSessionRequest);


module.exports = router;