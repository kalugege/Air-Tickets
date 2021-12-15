const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors'); // nice error messages
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const ticketScheme = new Schema({
    userId: {
        type:String,
        required:true
    },
    flightId: {
        type:String,
        required: true
    },
    purchase: {
        type:Date,
        required:true
    },
    canceled: {
        type:Boolean,
        default:false
    }
 
});
module.exports = mongoose.model('Tickets', ticketScheme);


