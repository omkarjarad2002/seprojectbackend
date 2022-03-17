const dotenv = require("dotenv")
const express = require("express")
const app = express(); 
const cors = require("cors")
const path = require("path")
dotenv.config({path: './config.env'})
const {connection} = require("../database/conn")
connection()


const bodyParser = require("body-parser")
app.use(bodyParser.json())

app.use(require("../router/auth"))  
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.json({limit:"10mb"}))

const PORT = process.env.PORT || 4457
 
app.listen(PORT,()=>{
    console.log(`server listening on port ${PORT}`)
})