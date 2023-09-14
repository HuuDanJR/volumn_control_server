var mongoose = require('mongoose');
 

const DriverSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String,
    },
    name:{
        required:true,type:String
    },
    code: {
        required: true,
        type: String,
    },
    image:{
        required:true,type:String,
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
})

const Driver = mongoose.model("drivers", DriverSchema);
module.exports = Driver;
