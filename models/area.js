// models/Area.js
const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
    {
        cities: [String],
        provinces: {
            type: String,
            required: true,
            unique: true
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const Area = mongoose.model("Area", areaSchema);

module.exports = Area;
