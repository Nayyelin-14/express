const user = require("../models/user");
const { uploadFileClodinary } = require("../utils/cloudinary");
const fs = require("fs");
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  let profile_photo = "";
  let cover_photo = "";

  const coverPhotoPath = req.files.cover_photo[0].path;
  const profilePhotoPath = req.files.profile_photo[0].path;

  if (!coverPhotoPath) {
    return null;
  }

  if (!profilePhotoPath) {
    return null;
  }
  try {
    if ([username, email, password].some((field) => field.trim() === "")) {
      res.status(404).json({
        message: "All fields are required",
      });
      throw new Error("All fields are required");
    }
    const existingUser = await user.findOne({
      $or: [
        {
          username,
        },
        { email },
      ],
    });
    if (existingUser) {
      res.status(409).json({
        message: "User existed",
      });
      throw new Error("User existed");
    }
    cover_photo = await uploadFileClodinary(coverPhotoPath);
    profile_photo = await uploadFileClodinary(profilePhotoPath);

    const UserDOC = await user.create({
      email,
      username: username.toLowerCase(),
      password,
      cover_photo,
      profile_photo,
    });
    const createdUser = await user
      .findById(UserDOC._id)
      .select("-password -refreshToken");
    if (!createdUser) {
      return res.status(500).json({
        message: "Something went wrong in registration",
      });
    }
    return res.status(200).json({
      message: "User created",
      createdUser,
    });
  } catch (error) {
    console.log(error);
    fs.unlinkSync(coverPhotoPath);
    fs.unlinkSync(profilePhotoPath);
  }
};
