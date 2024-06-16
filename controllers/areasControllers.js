const express = require('express');
const Area = require("../models/area");
const multer = require("multer");
const path = require("path");
const { Types } = require('mongoose');
const UPLOAD_FOLDER = "./public/image/areas";

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

const addAreas = async (req, res) => {
    try {
        const newArea = new Area(req.body);

        const savedArea = await newArea.save();
        res.status(201).json(savedArea);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const addCity = async (req, res) => {
    try {
        const {provinces, city} = req.body
        const response = await Area.findOneAndUpdate({provinces}, { $addToSet: { cities: city}}, {new: true})
        res.status(201).json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const deleteProvince = async (req, res) => {
    try {
        const { id } = req.params
        const response = await Area.findByIdAndDelete(id)
        res.status(201).json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const deleteCity = async (req, res) => {
    try {
        const { id } = req.params
        const city = req.query.city
        const response = await Area.findByIdAndUpdate({_id: new Types.ObjectId(id)}, { $pull: { cities: city}}, {new: true})
        res.status(201).json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAreas =async(req, res, next)=>{
    try {
        const areas = await Area.find();
        res.json(areas);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteArea = async (req, res, next) => {
    try {
        const {id} = req.params;

        const deletedArea = await Area.findByIdAndDelete(id);
        if (!deletedArea) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.json({ message: 'Area deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = { addAreas, getAreas, deleteArea, upload, addCity, deleteCity, deleteProvince}