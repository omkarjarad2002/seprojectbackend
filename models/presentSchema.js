const mongoose = require("mongoose");

const presentSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  presentRollNumbers: [{type:String}],
  upsentsRollNumbers: [{type:String}], 
  date: {
    type: Date,
    default: Date.now,
  },
});

const present = mongoose.model("PRESENTS", presentSchema);
module.exports = present;
