const passport = require('passport');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const pathToken = path.join(__dirname, '.', 'id_rsa_pub.pem');
const PUB_key = fs.readFileSync(pathToken, 'utf-8');
const utils = require('../controllers/jwtController');
const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
        console.log(token);
    }
    return token;
};

// const options = {
//     jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
//     secretOrKey: PUB_key,
//     algorithms: ['RS256']
// };
// const passportJWTOptions = {
//     // jwtFromRequest: req => req.cookies.jwt,
//     jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
//     secretOrKey: process.env.ACCES_TOKEN,
//     issuer: 'enter issuer here',
//     audience: 'enter audience here',
//     // algorithms: ['RS256'],
//     ignoreExpiration: false,
//     passReqToCallback: false,
//     jsonWebTokenOptions: {
//         complete: false,
//         clockTolerance: '',
//         maxAge: '1d', // 2 days
//         clockTimestamp: '100',
//         nonce: 'string here for OpenID'
//     }
// }

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false,
        },
        function (username, password, done) {
            User.findOne({ email: username }, function (err, user) {
                // const isValid = utils.validPassword(password, user.hash, user.salt);

                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!utils.validPassword(password, user.hash, user.salt)) {
                    return done(null, false);
                }

                return done(null, user);
            });
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

exports.authenticateToken = (req, res, next) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }

    if (token == null) return res.redirect('/login') 

    jwt.verify(token, process.env.ACCES_TOKEN, (err, user) => {
        console.log(err);
        if (err) { 
            
            return res.redirect('/login') 
        }else{

            req.user = user;

            next();
        }
    });
};
exports.isAdmin = (req, res, next) => {
    try {
        if (res.locals.user.isAdmin) next();
        else res.sendStatus(403);
    } catch (err) {
        res.sendStatus(403);
    }
};
// passport.use(new JwtStrategy(passportJWTOptions, function(jwt_payload, done) {
//     User.findOne({_id: jwt_payload.sub},

//         function(err, user) {
//         if (err) {
//              return done(err, false);
//         }
//         if (user) {

//              return done(null, user);
//         } else {
//              return done(null, false);

//         }
//     });
// }));

// module.exports = (passport) =>{
//     passport.use(strategy);
// }

//proverava kod logina da li postoji user
