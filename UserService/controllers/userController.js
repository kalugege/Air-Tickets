const mongoose = require('mongoose');
const User = mongoose.model('User');
const Card = mongoose.model('Card');
const crypto = require('crypto');
const promisify = require('es6-promisify');
const { prototype } = require('extract-text-webpack-plugin');
const jwt = require('jsonwebtoken');
const jwtController = require('./jwtController');
const mail = require('../handlers/mail');
const auth = require('./authController');
const axios = require('axios');
const format = require('date-fns/format');
exports.registerForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

exports.loginForm = (req, res) => {
    res.render('login', { title: 'Log In' });
};

exports.cardForm = (req, res) => {
    res.render('addCardForm', { title: 'Credit Card' });
};

exports.addCard = async (req, res) => {
    const card = new Card({
        name: req.body.name,
        surname: req.body.surname,
        cardNumber: req.body.number,
        pin: req.body.pin,
    });
    await card.save();

    const user = await User.findOne({ _id: res.locals.user.id });

    await user.updateOne({ $push: { card: card } });

    res.redirect('/account');
};

exports.cardFormBuy = (req, res) => {
    console.log('user: ' + res.locals.user);
    console.log('jwt: ' + req.cookies.jwt);
    res.render('addCardForm', { title: 'Credit Card' });
    //res.send('hi');
};

exports.addCardBuy = async (req, res) => {
    console.log(res.locals.user);
    console.log(req.cookies.jwt);
    const card = new Card({
        name: req.body.name,
        surname: req.body.surname,
        cardNumber: req.body.number,
        pin: req.body.pin,
    });
    await card.save();

    const user = await User.findOne({ _id: res.locals.user.id });

    await user.updateOne({ $push: { card: card } });

    const params = new URLSearchParams({
        flightId: req.session.flightId,
        userId: user.id,
        passengers: req.session.passengers,
    }).toString();

    const url = 'http://127.0.0.1:8080/tickets?' + params;
    axios
        .get(url)
        .then((response) => {
            res.redirect(response.config.url);
        })
        .catch((error) => {
            console.log(error);
        });
    // res.redirect('/account');
};

exports.validateRegister = async (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply name').notEmpty();
    req.checkBody('surname', 'You must supply surname').notEmpty();
    req.checkBody('email', 'You must sypply correct email address').isEmail();
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Your password do not match').equals(req.body.password);

    req.check(
        'password',
        'Password should be combination of at least one uppercase, one lower case, one digit and min 8, max 20 characters long'
    ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*-]{8,}$/, 'i');

    req.checkBody('passportNumber', 'You must supply a passport number').notEmpty();
    req.checkBody('passportNumber', 'Passport number must be numeric').isNumeric();

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

    const user = await User.findOne({ email: req.body.email });
    if (user) {
        req.flash('error', 'Account with that email address already exists!');
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash(),
        });
        return;
    }
    next(); // there were no errors
};

exports.register = async (req, res, next) => {
    const password = jwtController.genPassword(req.body.password);

    const user = new User({
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        passportNumber: req.body.passportNumber,
        hash: password.hash,
        salt: password.salt,
    });
    user.emailToken = crypto.randomBytes(20).toString('hex');

    const resetURL = `http://${req.headers.host}/account/verify/${user.emailToken}`;
    await mail.send({
        user,
        subject: 'Verify Account',
        resetURL,
        filename: 'verify-account', // renderovanje html-a
    });
    // req.flash('success', `You have been emailed a password reset link.`);

    await user
        .save()
        .then((user) => {
            // const jwt = jwtController.issueJWT(user);
            // res.cookie('jwt',jwt.token);
            next();
        })
        .catch((err) => next(err));
};

exports.verifyEmail = async (req, res, next) => {
    const user = await User.findOne({ emailToken: req.params.token });
    if (user) {
        user.isValid = true;
        user.emailToken = undefined;
        await user.save();
        req.user = user;
        next();
    } else {
        req.flash('error', 'Invalid token!');
        req.redirect('/');
    }
};

exports.account = (req, res) => {
    console.log('user: ' + res.locals.user);
    console.log('jwt: ' + req.cookies.jwt);
    res.render('account', { title: 'Edit Your Account' });
};
// exports.saveCookie = (req, res, next) => {
//     console.log('user: ' + res.locals.user);
//     console.log('jwt: ' + req.cookies.jwt);
//     const jwt = req.query.jwt;
//     res.cookie('jwt2', jwt);

//     next();
//     //res.redirect('/account');
// };
exports.updateAccount = async (req, res) => {
    if (req.body.update !== undefined) {
        const updates = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            passportNumber: req.body.passportNumber,
        };
        const user = await User.findOne({ _id: res.locals.user._id });
        console.log(user);
        if (user.email === req.body.email) {
            await User.findOneAndUpdate(
                { _id: res.locals.user._id },
                { $set: updates },
                {
                    new: true,
                    runValidators: true,
                    context: 'query',
                    useFindAndModify: false,
                }
            );
        } else {
            updates.isValid = false;
            await User.findOneAndUpdate(
                { _id: res.locals.user._id },
                { $set: updates },
                {
                    new: true,
                    runValidators: true,
                    context: 'query',
                    useFindAndModify: false,
                }
            );

            req.flash('info', 'Please verify your new email');
            user.emailToken = crypto.randomBytes(20).toString('hex');
            await user.save();
            const resetURL = `http://${req.headers.host}/account/verify/${user.emailToken}`;
            await mail.send({
                user,
                subject: 'Verify Account',
                resetURL,
                filename: 'verify-account', // renderovanje html-a
            });

            res.cookie('jwt', 'deleted');
            res.redirect('/login');
        }

        // );
        req.flash('success', 'The profile is updated!');
        res.redirect('back');
    } else {
        res.redirect('/resetPassword');
    }
};

exports.getInfo = async (req, res) => {
    if (req.query.userId != 'undefined') {
        const user = await User.findOne({ _id: req.query.userId }).populate({ path: 'card' });

        res.send(user);
    } else {
        res.send(null);
    }
};

exports.updateRank = async (req, res) => {
    const user = await User.findOne({ _id: req.query.userId });
    await user.updateOne({ $set: { rank: user.rank + parseInt(req.query.rank) } });
    res.send('http://127.0.0.1:8000');
};

exports.downgraderank = async (req, res) => {
    let ids = req.query.id.split(',');

    ids.forEach(async (id) => {
        const user = await User.findOne({ _id: id });
        await user.updateOne({ $set: { rank: user.rank - parseInt(req.query.rank) } });
    });

    res.send(true);
};

exports.dayOfWeek = (date) => {
    //Create an array containing each day, starting with Sunday.
    var weekdays = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
    //Use the getDay() method to get the day.
    var day = date.getDay();
    //Return the element that corresponds to that index.
    return weekdays[day];
};

exports.cancelEmail = async (req, res) => {
    let ids = req.query.id.split(',');

    ids.forEach(async (id) => {
        const user = await User.findOne({ _id: id });
        await mail.send({
            user,
            subject: 'Fligth cancelation',
            from: req.query.from,
            to: req.query.to,
            filename: 'cancel-flight',
        });
    });

    res.send(null);
};
