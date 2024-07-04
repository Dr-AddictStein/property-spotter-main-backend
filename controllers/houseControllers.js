const House = require("../models/house");
const express = require("express");
const userCollection = require("../models/users");
const router = express.Router();
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const houseAdd = async (houseData, image) => {
    try {
        const { suburb, city, province, bedroom, bathroom, houseOwnerName, houseOwnerEmail, houseOwnerPhone, agentName, agentEmail, agentPhone, p24_id } = houseData;
        const newData = houseData;
        console.log(":HOUSE",newData)
        newData.image = image;
        const newHouse = new House(newData);
        const savedHouse = await newHouse.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_ADMIN,
            subject: `New House Added !`,
            text: `A new house has been added to Property Spotter.
            Random ID: ${savedHouse.random_id}
            Adress: ${suburb} ${province} ${city}
            Bedrooms: ${bedroom}
            Bathrooms: ${bathroom}
            Owner Name: ${houseOwnerName}
            Owner Email: ${houseOwnerEmail}
            Owner Phone: ${houseOwnerPhone}
            Assigned agent Name: ${agentName}
            Assigned agent email: ${agentEmail}
            Assigned agent phone: ${agentPhone}
            By default Property24 ID: ${p24_id}
            Please review and take any necessary actions.
            
            Thank you,
            The Property Spotter Team
            `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        if (newData?.agentEmail) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: agentEmail,
                subject: `A New House Assign to You !`,
                text: `A new house has been Assign to You.
                Random ID: ${savedHouse.random_id}
                Adress: ${suburb} ${province} ${city}
                Bedrooms: ${bedroom}
                Bathrooms: ${bathroom}
                Owner Name: ${houseOwnerName}
                Owner Email: ${houseOwnerEmail}
                Owner Phone: ${houseOwnerPhone}
                Please review and take necessary actions.
                
                Thank you,
                The Property Spotter Team
            `,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
        }

        return savedHouse;
    } catch (error) {
        console.error("Error adding house:", error.message);
        throw error;
    }
};

const getHouse = async (req, res) => {
    const result = await House.find();
    let dex=[];
    for(let i=0;i<result.length;i++){
        if(result[i].status==="new"){
            dex.push(result[i]);
        }
    }
    for(let i=0;i<result.length;i++){
        if(result[i].status!=="new"){
            dex.push(result[i]);
        }
    }
    console.log("dex:",dex);
    res.send(dex);
};
const getAvailableHouse = async (req, res) => {
    const result = await House.find({ status: "available" });
    res.send(result);
};

const getHouseDataByAgency = async (req, res) => {
    const name = req.params.name;
    console.log(name);
    const result = await House.find({ agency: { $in: [name] } });
    console.log(result);
    res.send(result);
};
const getHouseListByAdmin = async (req, res) => {
    const result = await House.find({ agency: { $in: ["admin"] } });
    let dex=[];
    for(let i=0;i<result.length;i++){
        if(result[i].status==="new"){
            dex.push(result[i]);
        }
    }
    for(let i=0;i<result.length;i++){
        if(result[i].status!=="new"){
            dex.push(result[i]);
        }
    }
    console.log("dex:",dex);
    res.send(dex);
};
const getHouseListByAgent = async (req, res) => {
    const email = req.params.email;
    const result = await House.find({ agentEmail: email });
    let dex=[];
    for(let i=0;i<result.length;i++){
        if(result[i].status==="new"){
            dex.push(result[i]);
        }
    }
    for(let i=0;i<result.length;i++){
        if(result[i].status!=="new"){
            dex.push(result[i]);
        }
    }
    console.log("dex:",dex);
    res.send(result);
};

const getSpottedList = async (req, res) => {
    const email = req.params.email;
    const result = await House.find({ spooterEmail: email });
    res.send(result);
};
const getSpottedListSuccess = async (req, res) => {
    const email = req.params.email;
    const result = await House.find({
        $and: [{ spooterEmail: email }, { status: "available" }],
    });
    res.send(result);
};
const getSpottedListUnsuccess = async (req, res) => {
    const email = req.params.email;
    const result = await House.find({
        $and: [{ spooterEmail: email }, { status: "unsuccessful" }],
    });
    res.send(result);
};
const getSpottedListPaid = async (req, res) => {
    const email = req.params.email;
    const result = await House.find({
        $and: [{ spooterEmail: email }, { status: "sold, spotter paid" }],
    });
    res.send(result);
};
const listingsByAgencyAgent = async (req, res) => {
    const name = req.params.name;
    const result = await House.find({ agency: { $in: [name] } });
    res.send(result);
};

const singleHouseDetails = async (req, res) => {
    const id = req.params.id;
    const houseData = await House.findOne({ _id: id });
    res.send(houseData);
};

const updateHouseDataByAgent = async (req, res) => {
    try {
        const id = req.params.id;
        const upData = req.body;
        const agencyName = req.body.agencyName;
        const agencyDetails = await userCollection.findOne({
            name: agencyName,
            role: "agency",
        });
        upData.agencyEmail = agencyDetails.email;
        upData.agencyImage = agencyDetails.photoURL;
        const oldStatus=req.body.oldStatus;
        const status = req.body.status;
        const random_id=req.body.random_id;
        const result = await House.findByIdAndUpdate(id, upData);
        const house = await House.findById(id);
        console.log("fixated.!.!.!.",house)
        if (upData.oldStatus !== upData.status) {
            console.log("AAA up zzz","-> "+oldStatus,"-> "+status,"-> "+random_id)
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_ADMIN,
                subject: `Listing ${random_id} status has been updated`,

                text: `Listing ${random_id} status has been changed from ${oldStatus} to ${status}
                Please review and take any necessary actions.
                
                Thank you,
                The Property Spotter Team
                `,
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            const mailOptionsAgent = {
                from: process.env.EMAIL_USER,
                to: house.agentEmail,
                subject: `Listing ${upData.random_id} status has been updated`,

                text: `Listing ${upData.random_id} status has been changed from ${upData?.oldStatus} to ${upData?.status}
                Please review and take any necessary actions.
                
                Thank you,
                The Property Spotter Team
                `,
            };
            transporter.sendMail(mailOptionsAgent, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });

            const mailOptionsSpotters = {
                from: process.env.EMAIL_USER,
                to: house.spooterEmail,
                subject: `Listing ${upData.random_id} status has been updated`,

                text: `Listing ${upData.random_id} status has been changed from ${upData?.oldStatus} to ${upData?.status}
                Please review and take any necessary actions.
                
                Thank you,
                The Property Spotter Team
                `,
            };
            transporter.sendMail(mailOptionsSpotters, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
        }
        res.status(200).json(res);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    houseAdd,
    getHouse,
    getAvailableHouse,
    getSpottedList,
    getSpottedListSuccess,
    getSpottedListUnsuccess,
    getSpottedListPaid,
    updateHouseDataByAgent,
    singleHouseDetails,
    getHouseDataByAgency,
    getHouseListByAgent,
    listingsByAgencyAgent,
    getHouseListByAdmin,
    router,
};
