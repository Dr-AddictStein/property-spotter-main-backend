// models/Area.js
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    agency: {
        type: String,
        required: true
    }
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
