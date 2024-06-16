const express = require('express');
const Area = require("../models/area");
const multer = require("multer");
const path = require("path");
const Agency = require('../models/agency');
const UPLOAD_FOLDER = "./public/image/agency";

//----------------------- Multer -----------------//
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        if (file) {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
                    .replace(fileExt, "")
                    .toLowerCase()
                    .split(" ")
                    .join("-") +
                "-" +
                Date.now();
            cb(null, fileName + fileExt);
        }
    },
});

const upload = multer({ storage: storage });

const addAgency = async (req, res, next) => {
    try {

        const { agencyName, ownerEmail, password } = req.body;

        const newAgency = new Agency({
            agencyName, 
            ownerEmail,
            password ,
            image: req.file.filename,
        });
        const agency = await newAgency.save();
        res.status(201).json(agency);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getAgency =async(req, res, next)=>{
    try {
        const areas = await Agency.find();
        res.json(areas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const updateAgencyData = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { agencyName, ownerEmail, password } = req.body;


        const updateAgency = {};
        if (agencyName) updateAgency.agencyName = agencyName;
        if (ownerEmail) updateAgency.ownerEmail = ownerEmail;
        if (password) updateAgency.password = password;
        if (req.file) updateAgency.image = req.file.filename;
      
        const updatedAgency = await Agency.findByIdAndUpdate(id, updateAgency, { new: true });

        if (!updatedAgency) {
            return res.status(404).json({ error: 'Agency not found' });
        }
        res.json(updatedAgency);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const deleteAgency= async (req, res, next) => {
    try {
        const {id} = req.params;

        const deletedArea = await Agency.findByIdAndDelete(id);
        if (!deletedArea) {
            return res.status(404).json({ error: 'Agency not found' });
        }
        res.json({ message: 'Agency deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { addAgency,getAgency,deleteAgency,updateAgencyData, upload }