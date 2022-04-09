const mongoose = require("mongoose")  

const upsentSchema = new mongoose.Schema({

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

 
const upsent = mongoose.model("UPSENTS", upsentSchema);
module.exports = upsent;