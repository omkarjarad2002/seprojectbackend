const mongoose = require("mongoose")


const connection = async(req, res)=>{  
    const responce = await mongoose.connect("mongodb+srv://omkar:omkar032002@cluster0.3t0u5.mongodb.net/sepblprojectF?retryWrites=true&w=majority")

    if(responce){
        console.log("Connection successfull !")
    }else{
        console.log("ERROR")
    }
}

module.exports = {connection};
