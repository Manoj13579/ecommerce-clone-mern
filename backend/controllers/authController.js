import Users from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { acessTokenExpiryDate, refreshTokenExpiryDate, resetTokenExpiryDate } from "../Config/Config.js";
dotenv.config();
import nodemailer from "nodemailer";


const userssignup = async (req, res) => {
  
  try {
    // Check if the user email already exists
    let check = await Users.findOne({ email: req.body.email, authProvider: "jwt" });
    if (check) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // auth cycle 1: first sends role user or admin while in signup goes to generateTokens
    // model created
    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      photo: req.body.photo,
      role: 'user',
      authProvider: "jwt"
    });

    await user.save();


    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: acessTokenExpiryDate }
    );

   
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "none", // Prevent CSRF attacks
    });

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshTokenExpiryDate }
    );

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        _id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authProvider: user.authProvider
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

const userslogin = async (req, res) => {
  // auth cycle 1: after login user contains data about user including role
  try {
    const user = await Users.findOne({ email: req.body.email, authProvider: "jwt" });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong email or password" });
    }

    // Compare the plaintext password with the hashed password
    /*here await shows ... still should be using await because bcrypt.compare is an asynchronous function. Without await, the comparePass variable will not hold the correct result of the password comparison, leading to the condition where any password is accepted. */
    const comparePass = await bcrypt.compare(req.body.password, user.password);
    if (!comparePass) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong email or password" });
    }

    //Generate accessToken. contains user info role and id which determines role based auth
    // auth cycle 2: sends role user or admin data along with id and token goes to authMiddleware authenticateToken

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: acessTokenExpiryDate }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "none", // Prevent CSRF attacks
      path: '/',
      domain: '.onrender.com', 
    });

    const refreshToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: refreshTokenExpiryDate }
    );

    // Save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // httpOnly: true ensures javascript(document.cookie/cookies-parser) cannot access token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: '/',
      domain: '.onrender.com',
    });
    // Return response with new access token
    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id,
        photo: user.photo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authProvider: user.authProvider
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log('refreshToken', refreshToken);
  

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "unauthorized" });
  }

  const user = await Users.findOne({ refreshToken });

  if (!user) {
    return res
      .status(403)
      .json({ success: false, message: "insufficient permission" });
  }
  
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, userData) => {
      if (err)
        return res
          .status(403)
          .json({ success: false, message: "insufficient permission" });

      const newAccessToken = jwt.sign(
        { id: userData.id, role: userData.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: acessTokenExpiryDate }
      );

      
      const newRefreshToken = jwt.sign(
        { id: userData.id, role: userData.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiryDate }
      );

      // Update the refresh token in the database
      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: '/',
        domain: '.onrender.com',
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: '/',
        domain: '.onrender.com',
      });

      res
        .status(201)
        .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    }
  );
};

// Logout
const logout = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token not found" });
  }

  try {
    await Users.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Successfully logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function to handle password reset requests
const requestPasswordReset = async (req, res) => {
  /* when user clicks reset button in frontend it handles it.checks email, generates token and sends to mail id of user  */ 
  try {
    const user = await Users.findOne({ email: req.body.email, authProvider: "jwt" });
    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User with this email does not exist",
        });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: resetTokenExpiryDate }
    );

    
    // To send email from admin to user. Here, Gmail and nodemailer module are used
    // Purpose: This is used to authenticate with the email service (Gmail in this case). It tells Nodemailer which email account to use for sending emails.
    // Usage: This should be set to the email address that you own and have access to, from which you will send emails.
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        // When using Gmail, it is highly recommended to use an App-Specific Password instead of your actual Gmail password. This enhances security and allows you to revoke access without changing your main Gmail password.
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Sender and receiver of email containing resetUrl
    // This email address will appear in the user's inbox. Does not need to be a real address; can have process.env.EMAIL or other that matches your app. but google policy will only show process.env.EMAIL even mentioned <ecommerceclone@mail.com>. only shows "Ecommerce Clone"
    const mailOptions = {
      from:  '"Ecommerce Clone" <ecommerceclone@mail.com>', 
      to: user.email, // Recipient's email address
      subject: "Password Reset", // Email subject
      /* http://localhost:5173/reset-password is the URL that users will be directed when they click link inside their email. In deployment, need to change http://localhost:5173 */
      text: `http://localhost:5173/reset-password?token=${resetToken}&email=${req.body.email}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Email could not be sent" });
      }
      res
        .status(200)
        .json({
          success: true,
          message: "Password reset email sent successfully. Check your email",
        });
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Controller function to handle password reset
const resetPassword = async (req, res) => {
  /* after token is send from mail id of user frontend with token sends to this controller. this controller verifies token and updates password. process is complete.*/
  const { token, email, password } = req.body;

  // Verify the token
  jwt.verify(token, process.env.RESET_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Insufficient permission" });
    }

    try {
      // Find the user by email
      const user = await Users.findOne({ email: email, authProvider: "jwt" });
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }

      // Generate a salt and hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update the user's password
      user.password = hashedPassword;
      await user.save();

      // Return a success response
      res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error resetting password:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};
const jwtEmailConfirmation = async (req, res) => {
  

    const jwtEmailConfirmationToken = jwt.sign(
      { email: req.body.email },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: resetTokenExpiryDate }
    );

    
    // To send email from admin to user. Here, Gmail and nodemailer module are used
    // Purpose: This is used to authenticate with the email service (Gmail in this case). It tells Nodemailer which email account to use for sending emails.
    // Usage: This should be set to the email address that you own and have access to, from which you will send emails.
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        // When using Gmail, it is highly recommended to use an App-Specific Password instead of your actual Gmail password. This enhances security and allows you to revoke access without changing your main Gmail password.
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Sender and receiver of email containing resetUrl
    // This email address will appear in the user's inbox. Does not need to be a real address; can have process.env.EMAIL or other that matches your app. but google policy will only show process.env.EMAIL even mentioned <ecommerceclone@mail.com>. only shows "Ecommerce Clone"
    const mailOptions = {
      from:  '"Ecommerce Clone" <ecommerceclone@mail.com>', 
      to: req.body.email, // Recipient's email address
      subject: "email registration confirmation", // Email subject
      /* http://localhost:5173/reset-password is the URL that users will be directed when they click link inside their email. In deployment, need to change http://localhost:5173 */
      text: `http://localhost:5173/register?token=${jwtEmailConfirmationToken}&email=${req.body.email}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ success: false, message: "Email could not be sent" });
      }
      res
        .status(200)
        .json({
          success: true,
          message: "email confirmation link sent successfully. Check your email",
        });
    });
  };

const getAllUsers = async(req, res) => {
  try {
    const data = await Users.find();
    res.status(200).json({ success: true, message: 'successfully fetched all users', data})
  } catch (error) {
    res.status(500).json({ success: false, message: 'error fetching users', error: error})
  }
};


const adminProfileEdit = async (req, res) => {
  
  const _id = req.body.adminId;
  if (!_id) {
    return res.status(400).json({ success: false, message: "Unauthorized Request" });
  }

  try {
    // Hash the password before updating if it is provided
    let updateData = { email: req.body.email,
                       photo: req.body.photo
                      };
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }

    const data = await Users.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    } else {
      const { password, refreshToken, ...sanitizedData } = data.toObject();
      return res.status(200).json({ success: true, message: "Profile updated successfully", data: sanitizedData });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

const userProfileEdit = async (req, res) => {
  
  const _id = req.body.userId;
  if (!_id) {
    return res.status(400).json({ success: false, message: "Unauthorized Request" });
  }

  try {
    // Hash the password before updating if it is provided
    let updateData = { email: req.body.email,
                       photo: req.body.photo
                      };
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateData.password = hashedPassword;
    }

    const data = await Users.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    } else {
      const { password, refreshToken, ...sanitizedData } = data.toObject();
      return res.status(200).json({ success: true, message: "Profile updated successfully", data: sanitizedData });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error updating profile", error: err.message });
  }
};

export {
  userssignup,
  userslogin,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  jwtEmailConfirmation,
  getAllUsers,
  adminProfileEdit,
  userProfileEdit
};
