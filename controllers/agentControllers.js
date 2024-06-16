const express = require('express');
const Area = require("../models/area");
const multer = require("multer");
const path = require("path");
const agent = require('../models/agent');
const Agent = require('../models/agent');
const UPLOAD_FOLDER = "./public/image/agent";

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

const addAgent = async (req, res, next) => {
    try {

        const { name, email, password,agency } = req.body;

        const newAgent = new Agent({
            name, 
            email, 
            password,
            agency 
        });
        const agent = await newAgent.save();
        res.status(201).json(agent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAgent =async(req, res, next)=>{
    try {
        const areas = await Agent.find();
        res.json(areas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const updateAgent = async(req, res, next)=>{
    try {
        const { id } = req.params;
        const { name, email, password, agency } = req.body;
        const updateAgent = {};
        if (name) updateAgent.name = name;
        if (email) updateAgent.email = email;
        if (password) updateAgent.password = password;
        if (agency) updateAgent.agency = agency;

   
        const updatedAgent = await Agent.findByIdAndUpdate(id, updateAgent, { new: true });

        if (!updatedAgent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json(updatedAgent);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const deleteAgent= async (req, res, next) => {
    try {
        const {id} = req.params;
        console.log(id);

        const deletedAgent = await Agent.findByIdAndDelete(id);
        if (!deletedAgent) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { addAgent,getAgent, deleteAgent,updateAgent, upload }