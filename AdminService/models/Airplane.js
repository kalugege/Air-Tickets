const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const airplaneSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please supply airplane name.',
    },
    capacity: {
        type: Number,
        required: 'Please supply ',
    },
    active:{
        type:Date,
        
    }
});

module.exports = mongoose.model('Airplane', airplaneSchema);
