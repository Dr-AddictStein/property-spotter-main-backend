const expres = require("express");
var nodemailer = require("nodemailer");
require("dotenv").config();

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
const userCollection = require("../models/users");
const router = expres.Router();

router.post("/add", upload.single("image"), async (req, res) => {
    
    try {
        const path = "https://api.propertyspotter.co.za/image/areas/";
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
    console.log("HERERooo Issues zz:",req.body)
    try {
        const forStatus=req.body.forStatus;
        const id = req.params.id;
        const upData = req.body;
        const response = await House.findByIdAndUpdate(id, upData);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        if(forStatus){
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_ADMIN,
                subject: "Status Change",
                text: "Status Changed",
                html: `
                <b>Hello Admin,</b>
                <b>Status of Listing(RandomID:${req.body.random_id}) has been changed to ${req.body.status}</b>
            `,
            };
        
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.send({ Status: "!!!success" });
                } else {
                    return res.send({ Status: "Success" });
                }
            });
        }
        else{
            const house = await House.findById({_id:id})

            console.log("SUDU",house.agentEmail);
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: house.agentEmail,
                subject: "A new house has been assigned to you.",
                text: `A new house has been assigned to you. ID: ${req.body.house.random_id}`,
                html: `
                <p>Address: ${req.body.house.address + ' ' + req.body.house.suburb + ' ' + req.body.house.city + ' '+ req.body.house.province}</p></br>
                <p>Bedrooms: ${req.body.house.bedroom}</p></br>
                <p>Bathrooms: ${req.body.house.bathroom}</p></br>
                <p>Owner Name: ${req.body.house.houseOwnerName}</p></br>
                <p>Owner Email: ${req.body.house.houseOwnerEmail}</p></br>
                <p>Owner Phone: ${req.body.house.houseOwnerPhone}</p></br>

                <p>Please review and take necessary actions.</p>
            `,
            };

            
        
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return res.send({ Status: "!!!success" });
                } else {
                    return res.send({ Status: "Success" });
                }
            });
        }
    
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
