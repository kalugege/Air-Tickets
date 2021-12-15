const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const cardScheme = new Schema({
    name: {
        type:String,
        required:true
    },
    surname: {
        type:String,
        required:true
    },
    cardNumber: {
        type: Number,
        required:true
    },
    pin: {
        type: Number,
        required:true
    }
});



module.exports = mongoose.model('Card', cardScheme);
