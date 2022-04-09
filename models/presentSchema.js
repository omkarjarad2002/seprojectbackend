const mongoose = require("mongoose")  

const presentSchema = new mongoose.Schema({

    rollNumber:{
        type:Number,
        require:true
    },
    subject:{
        type:String,
        require:true
    },
    division:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        default:Date.now
    } 
})

 
const present = mongoose.model("PRESENTS", presentSchema);
module.exports = present;