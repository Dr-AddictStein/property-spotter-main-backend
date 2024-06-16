const mongoose = require('mongoose');

// Define schema
const spooterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create model
const Spooter = mongoose.model('Spooter', spooterSchema);
module.exports = Spooter;
