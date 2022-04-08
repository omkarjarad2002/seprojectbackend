const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const teacherSchema = new mongoose.Schema({

    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    department:{
        type:String, 
        required:true
    },
    year:{
        type:String,
        required:true
    }, 
    date:{
        type:Date,
        default:Date.now
    },
    tokens:[
        {
            refreshtoken:{
                type:String,
                required:true
            }
        }
    ]
})


 
//generating token by using jwt and adding in to the userSchema

teacherSchema.methods.generateAuthToken = async function(){
    try {
        let generateToken = jwt.sign({_id:this._id}, process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token : generateToken})
        await this.save();
        return generateToken; 
    } catch (error) {
        console.log(error)
    }
}


const teacher = mongoose.model("TEACHERS", teacherSchema);
module.exports = teacher;