// models/Area.js
const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
    agencyName: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
});

const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;