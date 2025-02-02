const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
  cloud_name: "dqvsnnqg1",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

exports.uploadFileClodinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("Upload complete", response.url);
    fs.unlinkSync(filePath);
    return response.url;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filePath);
    return null;
  }
};
