const expres = require("express");
const {
    houseAdd,
    getHouse,
    getSpottedList,
    getSpottedListSuccess,
    getSpottedListUnsuccess,
    listingsByAgencyAgent,
    singleHouseDetails,
    getHouseListByAdmin,
    getAvailableHouse,
    getHouseListByAgent,
    updateHouseDataByAgent,
    getHouseDataByAgency,
    getSpottedListPaid,
} = require("../controllers/houseControllers");
const { registration } = require("../controllers/spotter-controler");
const {
    addAreas,
    upload,
    getAreas,
    deleteArea,
    addCity,
    deleteCity,
    deleteProvince,
} = require("../controllers/areasControllers");
const {
    addAgency,
    getAgency,
    deleteAgency,
    updateAgencyData,
} = require("../controllers/agencyController");
const {
    addAgent,
    getAgent,
    deleteAgent,
    updateAgent,
} = require("../controllers/agentControllers");
const House = require("../models/house");
const {
    addMessage,
    getMessages,
} = require("../controllers/message_controllers");
const router = expres.Router();

router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const path = "http://localhost:5000/image/areas/";
        if (!req.file) {
            throw new Error("No file uploaded");
        }
        const image = path + req.file.filename;
        const savedHouse = await houseAdd(req.body, image);
        console.log(savedHouse);
        res.status(201).json(savedHouse);
    } catch (error) {
        console.error("Error adding house:", error.message);
        res.status(500).json({ error: error.message });
    }
});

router.post("/update/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const upData = req.body;
        const response = await House.findByIdAndUpdate(id, upData);
        res.status(201).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/registration", async (req, res) => {
    try {
        const spoReg = await registration(req.body);
        console.log(spoReg);
        res.status(201).json(spoReg);
    } catch (error) {
        console.error("Error adding house:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ---------area router-----------
router.post("/add-city", addCity);
router.delete("/delete-city/:id", deleteCity);
router.delete("/delete-province/:id", deleteProvince);
router.post("/add-area", upload.single("image"), addAreas);
router.post("/add-agency", upload.single("image"), addAgency);
router.post("/add-agent", upload.single("image"), addAgent);
router.get("/AreasData", getAreas);
router.get("/agencyData", getAgency);
router.get("/agentData", getAgent);
router.delete("/delete/:id", deleteArea);
router.delete("/deleteAgency/:id", deleteAgency);
router.delete("/deleted/:id", deleteAgent);
router.patch("/update/:id", updateAgent);
router.patch("/:id", updateAgencyData);
router.get("/houseData", getHouse);
router.get("/getHouseDataByAgency/:name", getHouseDataByAgency);
router.post("/updateHouseDataByAgent/:id", updateHouseDataByAgent);
router.get("/houseAvailableData", getAvailableHouse);
router.get("/houseDataByAdmin", getHouseListByAdmin);
router.get("/houseDataByAgent/:name", getHouseListByAgent);
router.get("/spotted-list/:email", getSpottedList);
router.get("/spotted-list-success/:email", getSpottedListSuccess);
router.get("/spotted-list-unsuccess/:email", getSpottedListUnsuccess);
router.get("/spotted-list-paid/:email", getSpottedListPaid);
router.get("/listings-by-agency-agent/:name", listingsByAgencyAgent);
router.get("/single-house-data/:id", singleHouseDetails);
router.post("/send-message", addMessage);
router.get("/get-message/:recieverId/:senderId", getMessages);
module.exports = router;
