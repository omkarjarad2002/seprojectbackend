const jwt = require("jsonwebtoken")
const mongoose = require("mongoose") 
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({

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
    branch:{
        type:String, 
        required:true
    },
    year:{
        type:Number,
        required:true
    }, 
    rollNumber:{
        type:String,
        required:true
    }, 
    date:{
        type:Date,
        default:Date.now
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]
})


userSchema.methods.generateAuthToken=async function(){
    try {
        let generateToken = jwt.sign({_id:this._id},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({ token : generateToken })
        await this.save();

        return generateToken;
        
    } catch (error) {
        console.log("ERROR")
    }
}


const Register = mongoose.model("REGISTERS", userSchema);
module.exports = Register;