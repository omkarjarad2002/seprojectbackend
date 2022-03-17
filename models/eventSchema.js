const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    file:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const Event = mongoose.model("EVENTS", eventSchema);
module.exports = Event;