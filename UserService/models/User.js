const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors'); // nice error messages
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const userScheme = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please supply a name.',
    },
    surname: {
        type: String,
        trim: true,
        required: 'Please supply a surname.',
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid Email Address'],
        required: true,
    },
    passportNumber: {
        type: Number,
        required: true,
    },
    card: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Card',
        
    }],

    hash: {
        type: String,
    },
    salt: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isValid: {
        type: Boolean,
        default: false,
    },
    rank: {
        type: Number,
        default:0, 
    },
    emailToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userScheme.virtual('gravatar').get(function () {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200&d=retro`;
});

// userScheme.plugin(passportLocalMongoose, { usernameField: 'email' }); // email koristim za username
userScheme.plugin(mongodbErrorHandler); // nice error messages

module.exports = mongoose.model('User', userScheme);
