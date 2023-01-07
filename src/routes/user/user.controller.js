const express = require("express");
const nodemailer = require("nodemailer");
const authHandler = require("../../middleware/auth");
const errorHandler = require("../../middleware/error");
const User = require("../../models/user");
const { generateAuthToken } = require("../../utils/helpers");
const { FormateUserObj } = require("./UserFormator");
const createUserSchema = require("./validationSchema");

const router = express.Router();

router.get(
  "/",
  authHandler,
  errorHandler(async (req, res) => {
    if (req.headers.limit !== undefined) {
      const limit = req.headers.limit;
      const skip = req.headers.skip;
      const sort = req.headers.sort;
      const users = await User.find().skip(skip).limit(limit).sort(sort);
      res.status(200).send(users);
    } else {
      const users = await User.find();
      res.status(200).send(users);
    }
  })
);

router.get(
  "/:userId",
  errorHandler(async (req, res) => {
    const user = await User.findOne({ _id: req.params.userId });

    res.status(200).send(user);
  })
);

router.get(
  "/verification/:token",
  errorHandler(async (req, res) => {
    const user = await User.findOne({ token: req.params.token });

    if (user.isVerified === "true") {
      res.status(400).send({ message: "You are already a verified user" });
    } else {
      let updatedData = {
        token: "expired",
        isVerified: "true",
      };

      const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
        new: true,
        runValidators: true,
      });
      try {
        res.status(200).json({
          status: "Success",
          data: {
            updatedUser,
          },
        });
      } catch (err) {
        console.log(err);
      }
    }

    res.status(200).send(user);
  })
);

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).send({ message: "Invalid Email " });
  }

  // if (req.body.password !== req.body.email) {
  //   return res.status(400).send({ message: "Invalid Password" });
  // }

  const token = generateAuthToken({
    username: user.username,
    email: user.email,
  });

  res.status(200).send({ message: "success", token });
});

router.post(
  "/signup",
  errorHandler(async (req, res) => {
    const payload = req.body;
    const { error } = createUserSchema(payload);
    if (error) {
      return res.status(404).send({ message: error.details[0].message });
    }
    let user = new User(payload);
    user = await user.save();

    const token3 = "calmdowncalmdownbabycalmdown";

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "fahadfordummies@gmail.com", // generated ethereal user
        pass: "lukgpkvteaejqfs", // generated ethereal password l
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: ' "Fahad Shakeel 👻" <fahadfordummies@gmail.com>', // sender address
      to: req.body.email, // list of receivers
      subject: "Account Creation ✔", // Subject line
      // text: "Thanks for creating account, please click the link given below to complete the registration process", // plain text body
      html: `<b>Thanks for creating account, please click the link given below to complete the registration process</b> <br> 
      <a href=http://localhost:5000/users/verification/${token3} target='_blank'> Confirm Here! </a> `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.send({ user });
  })
);

router.post("/", async (req, res) => {
  const payload = req.body;
  const { error } = createUserSchema(payload);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  let user = new User(payload);

  user = await user.save();
  res.status(200).send({ user });
});

router.patch("/:userId", async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.userId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  try {
    res.status(200).json({
      status: "Success",
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/:userId", async (req, res) => {
  const id = req.params.userId;
  await User.findByIdAndRemove(id).exec();
  res.send("Deleted");
});

module.exports = router;
