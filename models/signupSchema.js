const mongoose = require("mongoose")

const signupSchema = new mongoose.Schema({
 
    email:{
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


signupSchema.methods.generateAuthToken=async function(){
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


const SignedUser = mongoose.model("SIGNUP", signupSchema);
module.exports = SignedUser;