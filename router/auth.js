const express = require("express");
const path = require("path"); 
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/signupSchema");
const Register = require("../models/userSchema");
const Contact = require("../models/contactSchema");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const multer = require("multer");
const Event = require("../models/eventSchema"); 
const { response } = require("express");

//*****************************************UPLOAD IMAGE THROUGH MULTER***********************************//

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueFileName = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}${path.extname(file.originalname)}`;

    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage });

//*****************************************HOME PAGE***********************************//

// signup route
router.post("/signup", async (req, res) => {
  const { otp, otp_code, email, password, cpassword } = req.body;

  if (!otp || !otp_code || !email || !password || !cpassword) {
    return res.status(401).json({message:"Sorry something went wrong here !"});
  }

  try {
    const userExist = await User.findOne({ email: email });

    if(otp == otp_code){

    if (userExist) {
      return res.status(401).json({ message: "User allready exist !" });
    } else {
      const user = new User({ email, password, cpassword });
      await user.save();
      return res.status(200).json({ message: "User signup successfully !" });
    }
  }else{
    return res.status(401).json({message:"Otp does not match !"})
  }
  } catch (error) {
    return res.status(401).json({ message: error });
  }
});

// registration route
router.post("/register", async (req, res) => {
  const { name, email, phone, branch, year } = req.body;

  if (!name || !email || !phone || !branch || !year) {
    return;
  }

  try {
    const userExist = await User.findOne({ email: email });
    const allreadyExist = await Register.findOne({ email: email });

    if (userExist && !allreadyExist) {
      const user = new Register({ name, email, phone, branch, year });
      await user.save();
      return res
        .status(200)
        .json({ message: "User registered successfully !" });
    } else {
      return res.status(401).json({ message: "Sorry, user does not exist !" });
    }
  } catch (error) {
    return res.status(401).json({ message: error });
  }
});

//signIn route

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("from login route");
  console.log(email);
  console.log(password);

  try {
    const userLogin = await User.findOne({ email: email });

    if (!userLogin) {
      return res.status(404).json({ message: "Not found!" });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong credentials" });
    }

    const token = await userLogin.generateAuthToken();

    res.cookie("jwttoken", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true,
    });

    res.json({ user: userLogin });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/refreshtoken", async (req, res) => {
  const { jwttoken } = req.cookies;

  if (!jwttoken) {
    return res.status(401).json({ message: "ERROR" });
  }

  try {
    const tokenData = jwt.verify(jwttoken, process.env.SECRET_KEY);

    const user = await User.findOne({ _id: tokenData._id });

    if (!user) {
      return res.status(400).json({ message: "ERROR" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: "ERROR" });
  }
});



//sending email verification code for forggoton password route
router.post("/emailSendForOtp", async (req, res) => {
  const { email } = req.body;
  console.log("from emailSendForOtp route");
  console.log(email);
  let data = await User.findOne({ email: email });
  console.log(data)

  const responceType = {};

  if (data) { 

    let otpcode = Math.floor(Math.random() * 10000 + 1);
    responceType.statusText = "Success";
    responceType.message = "Please check Your Email Id";

    /////////////////////////////////////////////////////////////////

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jaradomkar1@gmail.com",
        pass: "Jarad@2432#",
      },
    });

    const mailOptions = {
      from: "jaradomkar1@gmail.com",
      to: email,
      subject: "One time verification OTP from DIGITAL CAMPUS",
      text: otpcode.toString(),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(401).json({error}); 
      } else {
        console.log("Email sent: " + info.response);
        let final__otp = otpcode.toString();
        console.log(email)
        console.log(final__otp)
        res.status(200).json({ email, final__otp }); 
      }
    });
     
  } else { 
    res.status(501).json({message:"Some error occured !"}); 
    responceType.statusText = "error";
    responceType.message = "Email Id not Exist";
  }
});

//sending email verification code for signup route
router.post("/emailSendForSignUpOtp", async (req, res) => {
  const { email } = req.body;
  console.log("from emailSendForOtp route");
  console.log(email);
  let data = await User.findOne({ email: email });

  const responceType = {};

  if (!data) { 

    let otpcode = Math.floor(Math.random() * 10000 + 1);
    responceType.statusText = "Success";
    responceType.message = "Please check Your Email Id";

    /////////////////////////////////////////////////////////////////

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jaradomkar1@gmail.com",
        pass: "Jarad@2432#",
      },
    });

    const mailOptions = {
      from: "jaradomkar1@gmail.com",
      to: email,
      subject: "One time verification OTP from DIGITAL CAMPUS",
      text: otpcode.toString(),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(401).json({error}); 
      } else {
        console.log("Email sent: " + info.response);
        let final__otp = otpcode.toString();
        console.log(email)
        console.log(final__otp)
        res.status(200).json({ email, final__otp }); 
      }
    });
     
  } else {
    res.status(501).json({message:"Some error occured!"}); 
    responceType.statusText = "error";
    responceType.message = "Email Id not Exist";
  }
});

//changing password

router.post("/changePassword", async (req, res) => {
  let {otp, otp_code, email, password, cpassword } = req.body;
  console.log(`otp=${otp},otp_code=${otp_code},email=${email},password=${password},cpassword=${cpassword}`)
  let data = await User.findOne({ email: email}); 

  const responce = {};

  if (data && otp===otp_code) {
    let currentTime = new Date().getTime();
    let diff = data.expireIn - currentTime;

    if (diff < 0) {
      responce.message = "Token Expire";
      responce.statusText = "error";
      res.status(402).json(responce);
    } else {
      let user = await User.findOne({ email: email }); 
      user.password=password
      user.cpassword=cpassword
      await user.save();
      responce.message = "Password changed Successfully";
      responce.statusText = "Success";
      res.status(200).json(responce);
    }
  } else {
    responce.message = "Invalid Otp";
    responce.statusText = "error";
    res.status(401).json(responce);
  }
});


//*****************************************PROFILE PAGE***********************************//

router.post("/getUserProfileInfo", async(req, res)=>{
  const {email} = req.body
  const UserInfo = await Register.findOne({email:email});
  return res.json({UserInfo});
})


// router.delete("/deleteProfileImage", async(req, res)=>{
//   const responce = await User.findByIdAndDelete({_id: req.params.id})
//   return res.json(responce);
// })



/*
//get events route

router.get("/getEvents",async (req, res)=>{
    const getEvents = await Event.find();
    return res.json(getEvents);
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

module.exports = router;
