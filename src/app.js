const dotenv = require("dotenv")
const express = require("express")
const app = express(); 
const { default: mongoose } = require("mongoose");
const cors = require("cors")
const path = require("path")
dotenv.config({path: './config.env'})
const {connection} = require("../database/conn")
connection()

// const DB = 'mongodb+srv://Omkarjarad:!ubU-uX5LqG2iz6@cluster0.uuezm.mongodb.net/sepblproject?retryWrites=true&w=majority'
// mongoose.connect(DB,{
//         useNewUrlParser:true,
//         useCreateIndex:true,
//         useUnifiedTopology:true,
//         useFindAndModify:false
//     }).then(()=>{
//     console.log("Connection successfull!!!!!!!!!!!!!!!!!")
// }).catch((err)=>console.log("No connection"))
 
 

const bodyParser = require("body-parser"); 
app.use(bodyParser.json())

app.use(require("../router/auth"))  
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json({limit:"10mb"}))

const PORT = process.env.PORT || 4457
 
app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`)
})