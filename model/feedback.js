var mongoose = require('mongoose');
var Driver = require('./driver'); // Import your Mongoose model
var Trip = require('./trip')

const { ObjectId } = mongoose.Types;

const FeedBackSchema = new mongoose.Schema({
    id: {
        required: true,
        type: String,
    },
    driver:{
        required:true,type:String
    },
    // driver: {
    //     required: true,
    //     type: ObjectId, // Reference the Driver schema by ObjectId
    //     ref: 'Driver', // Set the reference to the 'Driver' model
    //   },
    star: {
        required: true,
        type: Number,
    },
    //content:'i so happy when i had that ride'
    content: {
        required: true,
        type: String,
    },
    //experience:[good,friendly,ok,happy]
    experience:{
        required:true,
        type: [String],
        // type:String,
    },
    // trip:{
    //     type: ObjectId, // Reference the Driver schema by ObjectId
    //     ref: 'Trip', // Set the reference to the 'Driver' model
    // },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trips', // Make sure it matches the model name 'trips' defined in mongoose.model
    },
    //status: bad,good
    status:{
        required:true,
        type:String
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
})

const FeedBacks = mongoose.model("feedbacks", FeedBackSchema);
module.exports = FeedBacks;
