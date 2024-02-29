var mongoose = require('mongoose');
 

const VolumeControlSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String,
    },
    name:{
        required:true,type:String
    },
    deviceName:{
        required:true,type:String,
    },
    isSync: {
        required: true,
        type: Boolean,
    },
    url:{
        required:true,type:String,
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    minValue:{
        type:Number,
    },
    maxValue:{
        type:Number,
    },
    currentValue:{
        type:Number,
    },
    presetId:{
        type:String,
    }
})

const VolumeControl = mongoose.model("volumes", VolumeControlSchema);
module.exports = VolumeControl;
