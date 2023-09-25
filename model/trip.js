var mongoose = require('mongoose');
 

const TripSchema = new mongoose.Schema({
    feedback_id:{
        required:true,type:String,
    },
    driver:{
        required:true,type:String
    },
    customer_name: {
        required: true,
        type: String,
    },
    customer_number:{
        required:true,type:String,
    },
    from:{
        required:true,type:String,
    },
    to:{
        required:true,type:String,
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
})

const Trip = mongoose.model("trips", TripSchema);
module.exports = Trip;
