const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', check('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail(),
    body('password',
        'Password has to be valid.')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    authController.postLogin);

router.post(
    '/signup',
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-Mail exists already, please pick a different one.'); // throw an error inside of the promise (then block)
                    }
                })
        })
        .normalizeEmail(), // sanitize input email
    body('password',
        'Please enter a password with only numbers and text and at least 5 characters.') // default error message for all validators
        .isLength({ min: 5 })
        .isAlphanumeric()
        
        .trim(), // check the password in the body of the request
    body('confirmPassword').trim().custom((value, { req }) => { // customize validation
        if (value !== req.body.password) {
            throw new Error('Passwords have to match!');
        }
        return true;
    }),
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;