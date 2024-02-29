
var mongoose = require('mongoose');

const PresetSchema = new mongoose.Schema({
    presetId: {
        required: true,
        type: String
    },
    presetName: {
        required: true,
        type: String
    },
    
    volumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'volumes'
    }]
});

const PresetModel = mongoose.model("presets", PresetSchema);

module.exports = PresetModel;