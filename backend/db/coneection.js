const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
exports.connection = () => mongoose.connect(process.env.MONGOURL);
