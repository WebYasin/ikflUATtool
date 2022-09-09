'use strict';

const router                        = require('express').Router();
const { UserController }            = require('@api/controller');
const Auth                          = require('@middleware/authorization');

router.post('/',                       Auth.isAuthenticated(),                  UserController.registration);
router.post('/login',                                                           UserController.login);
router.post('/validate/email',          Auth.isAuthenticated(),                 UserController.validateEmail);
router.post('/upload/profile',          Auth.isAuthenticated(),                 UserController.uploadProfilePhoto);
router.put('/:id',                      Auth.isAuthenticated(),                 UserController.update);
router.get('/logout',                   Auth.isAuthenticated(),                 UserController.logout);
router.get('/',                         Auth.isAuthenticated(),                 UserController.get);
router.delete('/:id',                   Auth.isAuthenticated(),                 UserController.remove);
router.get('/validate/login',           Auth.isAuthenticated(),                 UserController.validateLogin);
router.get('/profile',                  Auth.isAuthenticated(),                 UserController.getUserProfile);
router.put('/updateStatus/:id',         Auth.isAuthenticated(),                 UserController.updateStatus);
router.get('/getUserList',              Auth.isAuthenticated(),                 UserController.getUserList);
router.post('/changePassword',          Auth.isAuthenticated(),                 UserController.changePassword);
router.post('/forgetPassword',                                                  UserController.forgetPassword);
router.post('/resend/otp',                                                      UserController.resendEmailOtp);
router.post('/verify/otp',                                                      UserController.verifyEmailOtp);

module.exports = router;