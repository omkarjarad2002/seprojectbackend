const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
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
const { findOneAndUpdate, find, findOne } = require("../models/signupSchema");
const teacher = require("../models/teacherSchema");
const { error } = require("console");
const { request } = require("http");
const present = require("../models/presentSchema");
const upsent = require("../models/upsentSchema");

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
    return res
      .status(401)
      .json({ message: "Sorry something went wrong here !" });
  }

  try {
    const userExist = await User.findOne({ email: email });

    if (otp == otp_code) {
      if (userExist) {
        return res.status(401).json({ message: "User allready exist !" });
      } else {
        const user = new User({ email, password, cpassword });
        await user.save();

        const token = await user.generateAuthToken();

        res.cookie("jwttoken", token, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
          httpOnly: true,
        });

        return res.status(200).json({ token });
      }
    } else {
      return res.status(401).json({ message: "Otp does not match !" });
    }
  } catch (error) {
    return res.status(401).json({ message: error });
  }
});

// registration route
router.post("/register", async (req, res) => {
  const { name, email, phone, branch, year, rollNumber } = req.body;

  if (!name || !email || !phone || !branch || !year || !rollNumber) {
    return;
  }

  try {
    const userExist = await User.findOne({ email: email });
    const allreadyExist = await Register.findOne({ email: email });

    if (userExist && !allreadyExist) {
      const user = new Register({
        name,
        email,
        phone,
        branch,
        year,
        rollNumber,
      });
      await user.save();
      return res
        .status(200)
        .json({ message: "User registered successfully !" });
    } else if (allreadyExist) {
      const user = await Register.findOneAndUpdate({
        name,
        email,
        phone,
        branch,
        year,
        rollNumber,
      });
      await user.save();
      return res
        .status(200)
        .json({ message: "student data updated successfuly!" });
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
    console.log(token);

    res.json({ user: userLogin, token });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/refreshtoken", async (req, res) => {
  const jwttoken = req.headers["authorization"];
  console.log(jwttoken);

  if (!jwttoken) {
    return res.status(401).json({ message: "ERROR 0" });
  }

  try {
    const tokenData = jwt.verify(jwttoken, process.env.SECRET_KEY);

    const tokenUser = await User.findOne({ _id: tokenData._id });

    if (!tokenUser) {
      return res.status(400).json({ message: "ERROR 1" });
    }
    return res.status(200).json({ tokenUser });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "ERROR 2" });
  }
});

//sending email verification code for forggoton password route
router.post("/emailSendForOtp", async (req, res) => {
  const { email } = req.body;
  console.log("from emailSendForOtp route");
  console.log(email);
  let data = await User.findOne({ email: email });
  console.log(data);

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
        res.status(401).json({ error });
      } else {
        console.log("Email sent: " + info.response);
        let final__otp = otpcode.toString();
        console.log(email);
        console.log(final__otp);
        res.status(200).json({ email, final__otp });
      }
    });
  } else {
    res.status(501).json({ message: "Some error occured !" });
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
        res.status(401).json({ error });
      } else {
        console.log("Email sent: " + info.response);
        let final__otp = otpcode.toString();
        console.log(email);
        console.log(final__otp);
        res.status(200).json({ email, final__otp });
      }
    });
  } else {
    res.status(501).json({ message: "Some error occured!" });
    responceType.statusText = "error";
    responceType.message = "Email Id not Exist";
  }
});

//changing password

router.post("/changePassword", async (req, res) => {
  let { otp, otp_code, email, password, cpassword } = req.body;
  console.log(
    `otp=${otp},otp_code=${otp_code},email=${email},password=${password},cpassword=${cpassword}`
  );
  let data = await User.findOne({ email: email });

  const responce = {};

  if (data && otp === otp_code) {
    let currentTime = new Date().getTime();
    let diff = data.expireIn - currentTime;

    if (diff < 0) {
      responce.message = "Token Expire";
      responce.statusText = "error";
      res.status(402).json(responce);
    } else {
      let user = await User.findOne({ email: email });
      user.password = password;
      user.cpassword = cpassword;
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

router.post("/getUserProfileInfo", async (req, res) => {
  const { email } = req.body;
  const UserInfo = await Register.findOne({ email: email });
  if (UserInfo) {
    return res.json({ UserInfo });
  } else {
    return res.status(401).json({ message: "Data not found" });
  }
});

//creating route for add Teachers

router.post("/addTeacher", async (req, res) => {
  const { name, email, phone, department, year, password, cpassword } =
    req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !department ||
    !year ||
    !password ||
    !cpassword
  ) {
    return;
  }

  try {
    const teacherExist = await teacher.findOne({ email });
    const userExist = await User.findOne({ email });

    if (!teacherExist && !userExist) {
      const user = new User({
        email,
        password,
        cpassword,
        isadmin: false,
        isteacher: true,
      });
      const userteacher = new teacher({
        name,
        email,
        phone,
        department,
        year,
        password,
        cpassword,
      });
      await user.save();
      await userteacher.save();

      //send email and password to teacher through email

      const responceType = {};

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
        subject: "Your Username and Password for DIGITAL CAMPUS is-",
        text: `username :- ${email} and password :- ${password}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.status(401).json({ error });
        } else {
          console.log("Email sent: " + info.response);
          let email = email.toString();
          let password = password.toString();
          console.log(email);
          console.log(password);
        }
      });

      return res.status(201).json({ message: "Success" });
    } else {
      return res.status(401).json({ message: "Error 1" });
    }
  } catch (error) {
    return res.status(501).json({ message: "Error 2" });
  }
});

//route for getting one specific teacher from email
router.post("/getOneTeacher", async (req, res) => {
  const { email } = req.body;
  const TeacherInfo = await teacher.findOne({ email: email });
  console.log(TeacherInfo);
  if (TeacherInfo) {
    return res.json({ TeacherInfo });
  } else {
    return res.status(401).json({ message: "Data not found" });
  }
});

//route for detecting  all teachers

router.get("/getAllTeachers", async (req, res) => {
  const getTeachers = await teacher.find({});
  return res.json({ getTeachers });
});

//route for present students
router.post("/present", async (req, res) => {
  const { rollNumber, subject, division } = req.body;

  try {
    const user = new present({ rollNumber, subject, division });
    await user.save();
  } catch (error) {
    return res.status(401).json({ message: "ERROR" });
  }
});

//route for absent students
router.post("/upsent", async (req, res) => {
  const { rollNumber, subject, division } = req.body;

  try {
    const user = new upsent({ rollNumber, subject, division });
    await user.save();
  } catch (error) {
    return res.status(401).json({ message: "ERROR" });
  }
});

//get all teachers for management route
router.get("/getAllTeachers",async (req, res)=>{

  const teachers = await teacher.find({})
  return res.json({teachers})

})


//get all students for presenti route
router.post("/getStudent", async(req, res)=>{

  const { branch, year,subject}=req.body

  if(!branch || !year){
    return;
  }

  try {

    const students = await Register.find({branch:branch, year:year});

    if(!students){
      return res.status(401).json({message:"Student not found !"})
    }else{
      return res.status(200).json({students})
    }
    
  } catch (error) {
    return res.status(501).json({message:"Internal server error !"})
  }

})

//exporting router module from auth to router file

module.exports = router;
