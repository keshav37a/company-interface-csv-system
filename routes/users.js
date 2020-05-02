const express = require('express');
const router = express.Router();
const usersController = require('../controllers/user_controller');

router.get('/', usersController.user);
router.get('/sign-in', usersController.signInRender);
router.get('/sign-up', usersController.signUpRender);


module.exports = router;