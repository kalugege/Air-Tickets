const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const ticketController = require('../controllers/ticketController');
const flightsController = require('../controllers/flightsController');
const { catchErrors } = require('../handlers/errorHandlers');
const passport = require('passport');
const jwtAuth = require('../handlers/passport');
const axios = require('axios');
const { response } = require('express');

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});
router.post('/', flightsController.storeQuery);

router.get('/mytickets', jwtAuth.authenticateToken, ticketController.ticketsPage);

// router.get('/allflights', flightsController.getAllFlights);

router.get('/allflights/page/:page', flightsController.getAllFlights);

router.get('/flights/page/:page', flightsController.getDepartureFlights);
router.get('/flights/return/page/:page', flightsController.getReturnFlights);
router.get('/flights/page/redirect', flightsController.redirect);

router.get('/ticket/:id/buy', jwtAuth.authenticateToken, catchErrors(ticketController.buyTicket));

// auth
router.get('/register', userController.registerForm);
router.post(
    '/register',
    userController.validateRegister,
    catchErrors(userController.register),
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Failed login.',
    }),
    authController.login
);

router.get('/login', userController.loginForm);
router.post(
    '/login',
    passport.authenticate('local', {
        session: false,
        failureRedirect: '/login',
        failureFlash: 'Failed login.',
    }),
    authController.login
);

router.get('/logout', authController.logout);

// account
router.get('/account', jwtAuth.authenticateToken, userController.account);
router.get('/accountadmin', userController.account);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.resetForm));
router.post(
    '/account/reset/:token',
    authController.confirmedPasswords,
    catchErrors(authController.updatePassword)
);
router.get('/account/verify/:token', userController.verifyEmail, authController.login);

router.get('/account/card', jwtAuth.authenticateToken, userController.cardForm);
router.post('/account/card', catchErrors(userController.addCard));

router.get('/account/card/buy', userController.cardFormBuy);
router.post('/account/card/buy', catchErrors(userController.addCardBuy));

router.get('/resetPassword', authController.resetPasswordForm);
router.post('/resetPassword', authController.resetPassword);

router.get('/getUserInfo', catchErrors(userController.getInfo));
router.get('/update/rank', catchErrors(userController.updateRank));
router.get('/downgrade/rank', catchErrors(userController.downgraderank));
router.get('/sendemail', catchErrors(userController.cancelEmail));

module.exports = router;
