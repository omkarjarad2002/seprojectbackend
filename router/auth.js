const express = require("express")
const path = require("path")
const router = express.Router();
const SignedUser = require("../models/signupSchema")
const User = require("../models/userSchema")
const Contact = require("../models/contactSchema")
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const multer = require("multer")
const Event = require("../models/eventSchema");
const nodemailer = require("nodemailer");

//*****************************************UPLOAD IMAGE THROUGH MULTER***********************************//

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename:(req, file, cb)=>{
        const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname)}`;

        cb(null, uniqueFileName);
    }
});

const upload = multer({ storage })

//*****************************************HOME PAGE***********************************//

// signup route
router.post("/signup", async (req, res)=>{
    const {email , password , cpassword} = req.body

    if(!email || !password || !cpassword){
        return
    }

    try {

        const userExist = await SignedUser.findOne({email : email})

        if(userExist){
            return res.status(401).json({message:"User allready exist !"})
        }else{
            const user = new SignedUser({email,password,cpassword})
            await user.save(); 
            return res.status(200).json({message:"User signup successfully !"})
        }
        
    } catch (error) {
        return res.status(401).json({message:error})
    }
})

// registration route
router.post("/register", async (req, res)=>{
    const {name , email , phone , branch , year } = req.body

    if(!name || !email || !phone || !branch || !year){
        return
    } 

    try {

        const userExist = await SignedUser.findOne({email : email})
        const allreadyExist = await User.findOne({email:email})

        if(userExist || allreadyExist){
            const user = new User({name, email, phone,branch,year})
            await user.save(); 
            return res.status(200).json({message:"User registered successfully !"}) 
        }else{ 
            return res.status(401).json({message:"Sorry, user does not exist !"})
        }
        
    } catch (error) {
        return res.status(401).json({message:error})
    }
})





 
//signIn route

router.post("/login", async (req, res)=>{
    const {email , password} = req.body

    if(!email || !password){
        return
    }

    
    try {
        const userLogin = await SignedUser.findOne({email:email})
        // const teacherLogin = await User.findOne({email:email, isteacher:true})

        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password)
            
            const token = await userLogin.generateAuthToken();

            res.cookie("jwttoken", token, {
                expires: new Date(Date.now() + 1000*60*60*24*7),
                httpOnly: true,
              });


            if(!isMatch){
                return res.status(401).json({message:"User not found !"})
            }else{

                return res.status(200).json({message:"Student login successfully !"})
            }
        }else{
            return res.status(400).json({message:"Invalid credentials !!"})
        }
        
    } catch (error) {
        return res.status(401).json({message:error})
    }
})


router.get("/refreshtoken", async (req, res)=>{
    const {jwttoken}=req.cookies;
  
    if(!jwttoken){
      return res.status(401).json({message:"ERROR"});
    }
  
    try {
  
      const tokenData = jwt.verify(jwttoken,  process.env.SECRET_KEY);
  
      const user = await SignedUser.findOne({_id:tokenData._id});
  
      if(!user){
        return res.status(400).json({message:"ERROR"});
      }
  
      return res.status(200).json({user});
      
    } catch (error) {
      return res.status(401).json({message:"ERROR"});
    }
  
  })


/*
//get events route

router.get("/getEvents",async (req, res)=>{
    const getEvents = await Event.find();
    return res.json(getEvents);
})

*/

//*****************************************PROFILE PAGE***********************************//
/*
router.get("/getUserProfileInfo/:id", async(req, res)=>{
    const UserInfo = await User.findOne({_id: req.params.id});
    return res.json({UserInfo});
})

router.post("/uploadProfileImage/:id", async(req, res)=>{
    const uploadImageRes = await User.findByIdAndUpdate({_id: req.params.id, file});
    return res.json(uploadImageRes);
})

router.delete("/deleteProfileImage", async(req, res)=>{
    const responce = await User.findByIdAndDelete({_id: req.params.id})
    return res.json(responce);
})
*/

//*****************************************CLASSROOM PAGE***********************************//
/*
router.get('/getClassrooms/:id', async(req, res)=>{
    const getClassrooms = await Classroom.find({_id: req.params.id});
    return res.json(getClassrooms);
})
*/
//*****************************************TEACHERS PAGE***********************************//

//get teachers info route 
/*
router.get('/getTeacherProfile/:id', async(req, res)=>{
    const responce = await User.findOne({_id: req.params.id});
    return res.json(responce);
})
*/
//post events route
/*
router.post("/events", async (req, res)=>{
    const {title, description, file} = req.body

    if(!title || !description || !file){
        return
    }

    try { 
        const event = new Event({title, description, file})
        await event.save();

        return res.status(201).json({message:"Posting event..."})

    } catch (error) {
       return res.status(401).json({message:error}) 
    }
})

*/
//*****************************************MANAGEMENT PAGE***********************************//

//get management profile info route
/*
router.get('/getAdminProfile/:id', async(req, res)=>{
    const responce = await User.findOne({_id: req.params.id});
    return res.json(responce);
})

//edit teachers info like mail,name, email, faculty route

router.post('/editTeacherInfo/:id', async( req, res)=>{
    const { email, phone, faculty} = req.body;

    const responce = await User.findByIdAndUpdate({_id: req.params.id, email:email, phone:phone, faculty:faculty});

    return res.json(responce);
})

//notice sending email for teacher from management route

router.post('/sendEmailtoteacher', async(req, res)=>{
    
    const { email, subject, notice } = req.body;

    let responce = await User.findOne({email:email});

    const responceType = {};
    
    if(!responce){
        responceType.statusText = "error";
        responceType.message = "Email Id does not Exist !"
    }else{
 
        responceType.statusText = "success";
        responceType.message = "Please check your email !";

    ////////////////////////////////////////////////

        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:'jaradomkar1@gmail.com',
                pass:'1234@1234',
            },

        });

        const mailOptions = {
            from:"jaradomkar1@gmail.com",
            to: req.body.email,
            subject : req.body.subject,
            text: req.body.notice,
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error.message);
            }else{
                console.log("Email sent: "+ info.response);
            }
        });

        return res.status(201).json({message:"SUCCESS"})
        
    }
})


*/


//exporting router module from auth to router file

module.exports = router
