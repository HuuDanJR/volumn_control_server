var express = require('express')
var morgan = require('morgan');
var app = express();
var path = require('path')
const mongoose = require('mongoose');
var cors = require('cors');
var router = express.Router();
var crypto = require('crypto')
app.use(express.json());
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
const logStream = fs.createWriteStream('log.txt', { flags: 'a' });
app.use(morgan('tiny'));
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', { stream: logStream }));
app.use(cors({
  origin: '*'
}));
const Excel = require('exceljs');

app.use('/', router);

var port = process.env.PORT || 8097;
app.listen(port);
console.log('app running at port vegas feedback car: ' + port);

//connect mongoDB
var config = require('./config')
config.connectDB()



app.get('/', function (req, res) {
  res.end('index page - volume control');
})

app.use(express.static('web/web'));
app.use(express.static('web/web/assets'));


const volumeModel = require('./model/volume');
const presetsModel = require('./model/preset');
app.post('/create_volume', async (req, res) => {
  try {
    const { id, name, deviceName } = req.body;

    // Check if there is a volume with the same id, name, and deviceName
    const existingVolume = await volumeModel.findOne({ id, name, deviceName });
    if (existingVolume) {
      return res.status(400).send({ "status": false, "message": "A volume with the same id, name, and deviceName already exists", "data": null });
    }

    const volume = new volumeModel(req.body);
    await volume.save();
    res.status(201).send(volume);
  } catch (err) {
    res.status(500).send({ "status": false, "message": "Internal server error", "data": null });
  }
});

// Route to list all records
app.get('/list_volume', async (req, res) => {
  try {
    // const volumes = await volumeModel.find().sort({ id: 1 }).lean(); 
    const volumes = await volumeModel.find().sort({ id: 1 }).lean(); // Sorting by id in ascending order (ASC)
    volumes.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    if (!volumes || volumes.length === 0) {
      res.status(404).send({ "status": false, "message": `no volumes found `, "data": null });
    } else {
      res.status(200).send({ "status": true, "message": `volumes found ${volumes.length}`, "data": volumes });
    }
  } catch (err) {
    res.status(500).send({ "status": false, "message": "fail to retrieve volumes", "data": null });
  }
});

// Route to delete a volume by ID
app.delete('/delete_volume/:id', async (req, res) => {
  try {
    const volume = await volumeModel.findByIdAndDelete(req.params.id);
    if (!volume) {
      res.status(404).send({ "status": false, "message": "volume not found", "data": null });
    } else {
      res.status(200).send({ "status": true, "message": "volume deleted successfully", "data": volume });
    }
  } catch (err) {
    res.status(500).send({ "status": false, "message": "fail to delete volume", "data": null });
  }
});
// Route to update a volume by ID
app.post('/update_volume/:id', async (req, res) => {
  try {
    const volume = await volumeModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true } // Return the updated document
    );
    if (!volume) {
      res.status(404).send({ "status": false, "message": "volume not found", "data": null });
    } else {
      res.status(200).send({ "status": true, "message": "volume updated successfully", "data": volume });
    }
  } catch (err) {
    res.status(500).send({ "status": false, "message": "fail to update volume", "data": null });
  }
});

// Route to update the currentValue field of a volume by ID
app.post('/update_volume_value/:id', async (req, res) => {
  try {
    const { currentValue } = req.body;

    const volume = await volumeModel.findOneAndUpdate(
      { _id: req.params.id },
      { currentValue }, // Only update the currentValue field
      { new: true } // Return the updated document
    );

    if (!volume) {
      res.status(404).send({ "status": false, "message": "volume not found", "data": null });
    } else {
      res.status(200).send({ "status": true, "message": "currentValue updated successfully", "data": volume });
    }
  } catch (err) {
    res.status(500).send({ "status": false, "message": "fail to update currentValue", "data": null });
  }
});


// Route to list all records
app.get('/list_preset', async (req, res) => {
  try {
    // const volumes = await volumeModel.find().sort({ id: 1 }).lean(); 
    const presets = await presetsModel.find().lean(); // Sorting by id in ascending order (ASC)
    presets.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    if (!presets || presets.length === 0) {
      res.status(404).send({ "status": false, "message": `no presets found `, "data": null });
    } else {
      res.status(200).send({ "status": true, "message": `presets found ${presets.length}`, "data": presets });
    }
  } catch (err) {
    res.status(500).send({ "status": false, "message": "fail to retrieve presets", "data": null });
  }
});

// create a new preset
app.get('/create_preset', async (req, res) => {
  try {
    const {  volumes, presetId,presetName } = req.body;
    const existingRecord = await presetsModel.findOne({ presetId, presetName, });
    if (existingRecord) {
      return res.status(400).send({ "status": false, "message": "A preset with the same id, name  already exists", "data": null });
    }
    const presets = new presetsModel(req.body);
    await presets.save();
    res.status(201).send(presets);
  } catch (err) {
    res.status(500).send({ "status": false, "message": "Internal server error", "data": null });
  }
});