const mongoose = require("mongoose");

const connection = async (req, res) => {
  mongoose.connect(
    "mongodb+srv://Omkarjarad:kkZqGYRfj4hR1Vd3@cluster0.uuezm.mongodb.net/sepblproject?retryWrites=true&w=majority"
  );

  const db = mongoose.connection;
  db.on("open", (error) => {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Database connected !");
    }
  });
};

module.exports = { connection };
