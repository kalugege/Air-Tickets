const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');
const passportUtil = require('../handlers/passport');
const utils = require('./jwtController');

const jwt = require('jsonwebtoken');

// exports.login = passport.authenticate('local',

//     // failureRedirect: '/login',
//     // failureFlash: 'Failed login.',
//     // successFlash: 'Successfully logged in!',
//     // successRedirect: '/',
//      (req,res)=>{
//     console.log(req.user);
// //    const user = await User.findOne({email:req.body.email});
// //    jwtToken = utils.issueJWT(user);
// //    res.cookie('token',jwtToken.token);
// //    console.log(jwtToken.token);
//    res.redirect('/');
// });
// exports.login =  (req,res,next) => {

//     User.findOne({email: req.body.email})

//         .then((user) => {

//             if(!user) {
//                 res.status(401).json({succes : false, msg:"ne postoji"});
//             }

//             const isValid = utils.validPassword(req.body.password,user.hash, user.salt);
//             console.log(isValid);
//             if(isValid) {

//             }
//             else{
//                 res.status(401).json({succes : false, msg:"pogresna sifra"});
//             }
//         }).catch((err)=>{
//             next(err);
//         })
// }

// exports.loginJWT = (req,res)=>{
//     User.findOne({username : req.body.name})
// };
exports.login = async (req, res) => {
    console.log(req.user);
    if (req.user.isValid) {
        console.log(req.user);
        jwtToken = utils.issueJWT(req.user);
        res.cookie('jwt', jwtToken.token);
        req.flash('success', 'You are logged in!');
        res.redirect('/');
    } else {
        req.flash('info', 'Please verify your mail.');
        res.redirect('/login');
    }
};
exports.logout = async (req, res) => {
    res.cookie('jwt', 'deleted');
    req.logout();
    req.flash('success', 'You are logged out!');

    res.redirect('/');
};

// exports.isLoggedIn = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         next();
//         return;
//     }
//     req.flash('error', 'You must be logged in to do that!');
//     res.redirect('/login');
// };

exports.forgot = async (req, res) => {
    //1. See if user with that email exists
    const user = await User.findOne({ email: req.body.email });
    //res.json(user);
    if (!user) {
        req.flash('error', 'No account with that email exists.');
        //req.flash('success', 'A password reset has been mailed to you.'); //? security poruka iako ne postoji user
        return res.redirect('/login');
    }
    //2. Set reset token and expiry on their account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 1800000; // 30min
    await user.save();
    //3. Send email with the token
    //? req.headers.host => vraca domen odnosno localhost
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    await mail.send({
        user,
        subject: 'Password Reset',
        resetURL,
        filename: 'password-reset', // renderovanje html-a
    });
    req.flash('success', `You have been emailed a password reset link.`);
    //4. redirect to login page
    res.redirect('/login');
};

exports.resetForm = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }, // token is still active
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    // if there is user show reset form
    res.render('reset', { title: 'Reset your Password' });
};

exports.confirmedPasswords = (req, res, next) => {
    req.checkBody('password', 'Password cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Password Confirm cannot be blank!').notEmpty();
    req.checkBody('password-confirm', 'Your password do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash(
            'error',
            errors.map((err) => err.msg)
        );
        res.render('reset', {
            title: 'Reset your Password',
            flashes: req.flash(),
        });
        return; // stop function from running
    }
    next();
};

exports.updatePassword = async function (req, res) {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }

    const password = await utils.genPassword(req.body.password);
    user.hash = password.hash;
    user.salt = password.salt;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    jwtToken = utils.issueJWT(user);
    res.cookie('jwt', jwtToken.token);

    req.flash('success', 'Your password has been reset! You are now logged in!');
    res.redirect('/');
};
exports.resetPasswordForm = (req, res) => {
    res.render('changePassword');
};
exports.resetPassword = async (req, res, next) => {
    const user = res.locals.user;
    req.checkBody('Oldpassword', 'Password cannot be blank').notEmpty();

    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Your password do not match').equals(req.body.password);
    isValid = utils.validPassword(req.body.Oldpassword, user.hash, user.salt);
    const errors = req.validationErrors();
    if (errors) {
        req.flash(
            'error',
            errors.map((err) => err.msg)
        );
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash(),
        });
        return; // stop function from runnin`g
    }

    if (isValid) {
        const password = await utils.genPassword(req.body.password);
        user.hash = password.hash;
        user.salt = password.salt;
        await user.save();
    } else {
        req.flash('error', 'Wrong Old Password');
        res.redirect('back');
        return;
    }
    res.redirect('/');
};
