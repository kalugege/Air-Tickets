const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors'); // nice error messages
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const flightSscheme = new Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        default: function () {
            return this.arrival - this.departure;
        },
    },
    price: {
        type: Number,
        required: true,
    },
    departure: {
        type: Date,
        required: true,
    },
    arrival: {
        type: Date,
        required: true,
    },
    passengersNumber: {
        type: Number,
        default: 0,
    },
    airplane: {
        type: mongoose.Schema.ObjectId,
        ref: 'Airplane',
        required: true,
    },
    canceled: {

        type:Boolean,
        default:false
    }

});

module.exports = mongoose.model('Flight', flightSscheme);
