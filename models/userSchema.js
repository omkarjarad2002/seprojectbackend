const mongoose = require("mongoose")

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
    year:{
        type:Number,
        required:true
    },
    branch:{
        type:String, 
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    isteacher:{
        type:Boolean,
        default:false
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


userSchema.methods.generateAuthToken=async function(){
    try {
        const generateRefreshToken = jwt.sign({_id:this._id}, process.env.REFRESH__TOKEN);
        const generateAccessToken = jwt.sign({_id:this._id}, process.env.ACCESS__TOKEN);
        this.tokens = this.tokens.concat({refreshtoken:generateRefreshToken, accesstoken:generateAccessToken})

        await this.save();

        return refreshtoken;
        
    } catch (error) {
        console.log("ERROR")
    }
}


const User = mongoose.model("USERS", userSchema);
module.exports = User;