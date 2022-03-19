const mongoose = require("mongoose")


const connection = async(req, res)=>{  
    const responce = await mongoose.connect("mongodb+srv://Omkarjarad:3vseLaCGLkv4UCNd@cluster0.uuezm.mongodb.net/sepblproject?retryWrites=true&w=majority")

    if(responce){
        console.log("Connection successfull !")
    }else{
        console.log("ERROR")
    }
}

module.exports = {connection};