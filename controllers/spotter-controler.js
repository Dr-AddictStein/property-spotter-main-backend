const { Router } = require("express");

const Spooter = require("../models/spooter-registration");
const House = require("../models/house");

const registration = async (spotterData) => {
    try {
        const { name, email, password } = spotterData;
        const newSpotter = new Spooter({
            name,
            email,
            password,
        });
        const spooter = await newSpotter.save();
        return spooter;
    } catch (error) {
        console.error("Error adding house:", error.message);
        throw error;
    }
};
const router = Router();

// Spotters Router

router.get("/all-spotters", async (req, res) => {
    try {
        const result = await Spooter.find();

        res.send(result);
    } catch (error) {
        console.error("Error adding house:", error.message);
        throw error;
    }
});

router.post("/edit-spotter/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const result = await Spooter.findByIdAndUpdate(id, updateData);
        res.send(result);

    } catch (error) {
        console.error("Error adding house:", error.message);
        throw error;
    }
});

router.get("/all-list/:email", async (req, res) => {
    try {
        const email = req.params.email
        
        const result = await House.find({spooterEmail: email});
        res.send(result);
    } catch (error) {
        console.error("Error adding house:", error.message);
        throw error;
    }
});

module.exports = { registration, router };
