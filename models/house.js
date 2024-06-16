const mongoose = require('mongoose');
const crypto = require('crypto');

// Define schema
const houseSchema = new mongoose.Schema({
    random_id : {
        type: Number,
        unique: true
    },
    spooterName: {
        type: String,
        required: true
    },
    spooterEmail: {
        type: String,
        required: true
    },
    propertyType:{
        type: String,
        required: true
    },
    commissionAmount: {
        type: Number
    },
    status: {
        type: String,
        required: true
    },
    room: {
        type: String,
    },
    parking: {
        type: Boolean,
    },
    suburb: {
        type: String,
    },
    city: {
        type: String,
    },
    province: {
        type: String,
    },
    bedroom: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
       
    },
    bathroom: {
        type: String,
    },
    sellTime: {
        type: String,
        required: true
    },
    houseOwnerName: {
        type: String,
        required: true
    },
    houseOwnerEmail: {
        type: String,
        required: true
    },
    houseOwnerPhone: {
        type: String,
        required: true
    },
    agencyName: {
        type: String,
    },
    agencyEmail: {
        type: String,
    },
    agencyImage: {
        type: String,
    },
    agentName: {
        type: String,
    },
    agentEmail: {
        type: String,
    },
    agentImage: {
        type: String,
    },
    agency: {
        type: [String],
    },
    createDate: {
        type: String,
        required: true,
        default: new Date()
    }
});

async function generateRandomId() {
    let randomId;
    let idExists = true;

    while (idExists) {
        randomId = crypto.randomInt(100000, 999999);
        idExists = await mongoose.model('House').exists({ random_id: randomId });
    }

    return randomId;
}


houseSchema.pre('save', async function (next) {
    if (this.isNew) {
        this.random_id = await generateRandomId();
    }
    next();
});

// Create model
const House = mongoose.model('House', houseSchema);

module.exports = House;
