const { userInfo } = require("os");
const user = require("../models/user");
const { uploadFileClodinary } = require("../utils/cloudinary");
const fs = require("fs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  let profile_photo = "";
  let cover_photo = "";
  console.log(req.files);
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

const generateTokens = async (userID) => {
  try {
    const existingUser = await user.findById(userID);
    if (!existingUser) {
      return res.status(404).json({
        message: "Something went wrong",
      });
    }

    const accessToken = await existingUser.AccessToken();
    const refreshToken = await existingUser.RefreshToken();

    existingUser.refreshtoken = refreshToken;
    await existingUser.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};

exports.LoginController = async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existedUser = await user.findOne({ $or: [{ username }, { email }] });
    if (!existedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordCorrect = await existedUser.isPasswordMatch(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid crendetials" });
    }
    const { accessToken, refreshToken } = await generateTokens(existedUser._id);

    const loggedUser = await user
      .findById(existedUser._id)
      .select("-password -refreshtoken");
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .cookie("REFRESHTOKEN", refreshToken, options)
      .cookie("ACCESSTOKEN", accessToken, options)
      .json({
        message: "Logged in successfully ",
        user: loggedUser,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.newRefreshToken = async (req, res) => {
  const inComingRefreshToken =
    req.cookies.REFRESHTOKEN || req.body.refresh_Token;
  if (!inComingRefreshToken) {
    return res.status(401).json({
      message: "No token found",
    });
  }
  try {
    const decodeRefreshToken = jwt.verify(
      inComingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );
    const existedUserDoc = await user.findById(decodeRefreshToken?._id);
    if (!existedUserDoc) {
      return res.status(404).json({
        message: "User not  found",
      });
    }

    if (inComingRefreshToken !== existedUserDoc.refreshtoken) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    }

    const { accessToken, refreshToken } = await generateTokens(
      existedUserDoc._id
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .cookie("REFRESHTOKEN", refreshToken, options)
      .cookie("ACCESSTOKEN", accessToken, options)
      .json({
        message: "Logged in successfully ",
        user: loggedUser,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.logoutHandeler = async (req, res) => {
  console.log(req.user);

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      message: "Unauthorized User",
    });
  }
  try {
    await user.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshtoken: 1,
        },
      },
      { new: true }
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res
      .status(200)
      .clearCookie("REFRESHTOKEN", options)
      .clearCookie("ACCESSTOKEN", options)
      .json({
        message: `${req.user.username} logged out  successfully`,
      });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
