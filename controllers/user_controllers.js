const express = require("express");
const router = express.Router();
const userCollection = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const UPLOAD_FOLDER = "./public/image/areas";
var nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");
const crypto = require("crypto");

//----------------------- Multer -----------------//
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        if (file) {
            const fileExt = path.extname(file.originalname);
            const fileName =
                file.originalname
                    .replace(fileExt, "")
                    .toLowerCase()
                    .split(" ")
                    .join("-") +
                "-" +
                Date.now();
            cb(null, fileName + fileExt);
        }
    },
});
var upload = multer({
    storage: storage,
});
//---------------------------------------------//

//----------------------- Auth(VerifyToken,jwt) -----------------//
// Route to verify token
router.get("/verifyToken", verifyToken, (req, res) => {
    const user = req.user;
    res.send(user);
});
//---------------------------------------------//

//----------------------- GET -----------------//
// All User Data Get
router.get("/allusers", async (req, res) => {
    try {
        const user = await userCollection.find().toArray();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/all-agency", async (req, res) => {
    try {
        const user = await userCollection.find({ role: "agency" }).toArray();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/all-agents/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const user = await userCollection
            .find({ role: "agent", agencyName: name })
            .toArray();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/spotters", async (req, res) => {
    try {
        const user = await userCollection.find({ role: "spotter" }).toArray();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/allusers/filterby/spooter", async (req, res) => {
    try {
        const users = await userCollection.find({ role: "spotter" }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/allusers/filterby/agent/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const users = await userCollection.find({ agencyName: name }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});
router.get("/allusers/filterby/agent", async (req, res) => {
    try {
        const users = await userCollection.find({ role: "agent" }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/allusers/filterby/agency", async (req, res) => {
    try {
        const users = await userCollection.find({ role: "agency" }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

router.get("/allusers/filterby/spotter", async (req, res) => {
    try {
        const users = await userCollection.find({ role: "spotter" }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// Single User Data Get
router.get("/singleuser/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const user = await userCollection.findOne({ email });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});
//---------------------------------------------//

//----------------------- POST -----------------//
// Manual Signup
router.post("/signup", upload.single("images"), async (req, res) => {

    console.log('hit this signup route');

    const { name, email, role, password, agencyName, termsAndcondition } =
        req.body;

    const filenames = req.file.filename;
    const query = { email: email };

    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const existingUserByEmail = await userCollection.findOne(query);

    if (existingUserByEmail) {
        return res.status(400).json({
            error: "An account with this email already exists. Please use a different email.",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Hash password and create new user object
    const hashedPassword = await bcrypt.hash(password, 10);
    const path = "http://localhost:5000/image/areas/";
    const userData = {
        name: name,
        email: email,
        role: role,
        photoURL: path + filenames,
        password: hashedPassword,
        termsAndcondition,
        verification: false,
        otp,
        about: "",
        location: "",
        agencyName: agencyName || "",
    };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "algobot701@gmail.com",
            pass: "jfth qddl nkgp yitb",
        },
    });

    const mailOptions = {
        from: '"Fred Foo 👻"',
        to: email,
        subject: "Email Verification",
        text: "Confirmation email",
        html: `
        <b>Hello ${name}. Please confirm your otp.</b>
        <b>Your confirmation code is</b>
        <h1>${otp}</h1>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            return res.send({ Status: "Success" });
        }
    });

    const mailOptionsTwo = {
        from: "no-reply@property-spotter.com",
        //it's be chnage for this site owner or admin email
        to: "shimulzahan636@gmail.com",
        subject: `New ${role} has been registered on Property Spotter!`,
        text: `
          A new ${role} has been registered on Property Spotter!
          Name: ${name}
          Email: ${email}
          Please review and take any necessary actions.
      
          Thank you,
          The Property Spotter Team
        `,
    };

    transporter.sendMail(mailOptionsTwo, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

    const insertedData = await userCollection.insertOne(userData);
    res.status(200).json({
        message: "User created successfully",
        insertedData,
    });
});
// Email pass login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Input validation:
        if (!email || !password) {
            res.status(401).json({ error: "Invalid email or password." });
        }

        // Search by email only:
        const user = await userCollection.findOne({ email });

        // Handle cases where no user is found or password is incorrect:
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res
                .status(401)
                .json({ error: "Invalid email or password." });
        }

        // Check if the user is verified:
        if (!user.verification) {
            return res.status(401).json({ error: "User not verified." });
        }

        const token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
});

// Google Signup + Login
router.post("/signup/google", async (req, res) => {
    const { name, email, role, photoURL } = req.body;
    const query = { email: email };

    const existingUser = await userCollection.findOne(query);
    if (!existingUser) {
        const userData = {
            name: name,
            email: email,
            role: role,
            photoURL: photoURL,
            termsAndcondition: true,
            verification: true,
            password: "",
            about: "",
            location: "",
        };

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "algobot701@gmail.com",
                pass: "jfth qddl nkgp yitb",
            },
        });

        const mailOptionsTwo = {
            from: "no-reply@property-spotter.com",
            //it's be chnage for this site owner or admin email
            to: "shimulzahan636@gmail.com",
            subject: `New ${role} has been registered on Property Spotter!`,
            text: `
            A new ${role} has been registered on Property Spotter!
            Name: ${name}
            Email: ${email}
            Please review and take any necessary actions.
        
            Thank you,
            The Property Spotter Team
        `,
        };

        transporter.sendMail(mailOptionsTwo, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        const insertedData = await userCollection.insertOne(userData);
    }

    const user = await userCollection.findOne(query);
    const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.send({ token, user });
});
// Manual spotter Signup
router.post("/signup/spotter", upload.single("images"), async (req, res) => {
    const { name, email, role, password, termsAndcondition } = req.body;
    const filenames = req.file.filename;
    const query = { email: email };

    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    async function generateRandomId() {
        let randomId;
        let idExists = true;

        while (idExists) {
            randomId = crypto.randomInt(100000, 999999);
            idExists = await userCollection.findOne({ random_id: randomId });
        }

        return randomId;
    }

    const existingUserByEmail = await userCollection.findOne(query);

    if (existingUserByEmail) {
        return res.status(400).json({
            error: "An account with this email already exists. Please use a different email.",
        });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Hash password and create new user object
    const hashedPassword = await bcrypt.hash(password, 10);
    const path = "http://localhost:5000/image/areas/";
    const random_id = await generateRandomId();
    const userData = {
        name: name,
        email: email,
        role: role,
        photoURL: path + filenames,
        password: hashedPassword,
        termsAndcondition,
        verification: false,
        random_id: random_id,
        otp,
        about: "",
        location: "",
    };

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification",
        text: "Confirmation email",
        html: `
        <b>Hello ${name}. Please confirm your otp.</b>
        <b>Your confirmation code is</b>
        <h1>${otp}</h1>
    `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            return res.send({ Status: "Success" });
        }
    });

    const mailOptionsTwo = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_ADMIN,
        subject: `New ${role} has been registered.`,
        text: `
          A ${role} has been registered on Property Spotter!
          Name:${name}
          Email:${email}
          Please review and take any necessary actions.
      
          Thank you,
          The Property Spotter Team
        `,
    };

    transporter.sendMail(mailOptionsTwo, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });

    const insertedData = await userCollection.insertOne(userData);
    res.status(200).json({
        message: "User created successfully",
        insertedData,
    });
});

// Manual houseowner Signup
router.post("/signup/houseowner", upload.single("images"), async (req, res) => {
    const { name, email, role, password } = req.body;

    const filenames = req.file.filename;
    const query = { email: email };

    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const existingUserByEmail = await userCollection.findOne(query);

    if (existingUserByEmail) {
        return res.status(400).json({
            error: "An account with this email already exists. Please use a different email.",
        });
    }

    // Hash password and create new user object
    const hashedPassword = await bcrypt.hash(password, 10);
    const path = "http://localhost:5000/image/areas/";
    const userData = {
        name: name,
        email: email,
        role: role,
        photoURL: path + filenames,
        password: hashedPassword,
    };

    const insertedData = await userCollection.insertOne(userData);
    res.status(200).json({
        message: "User created successfully",
        insertedData,
    });
});
//---------------------------------------------//

// Admin added Agency
router.post("/agency/add-agency", upload.single("images"), async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const existingAgency = await userCollection.findOne({ email: email });
        if (existingAgency) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);

        const hashedPassword = await bcrypt.hash(password, 10);
        const paths = "http://localhost:5000/image/areas/";
        const newAgency = {
            name,
            email,
            password: hashedPassword,
            termsAndcondition: true,
            verification: false,
            otp,
            role: "agency",
            photoURL: paths + req.file.filename,
            about: "",
            location: "",
        };

        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "algobot701@gmail.com",
                pass: "jfth qddl nkgp yitb",
            },
        });

        var mailOptions = {
            from: '"Fred Foo 👻"',
            to: email,
            subject: "Email Verification",
            text: "Confirmation email",
            html: `
          <b>Hello ${name}. Please confirm your otp.</b>
          <b>Your confirmation code is</b>
          <h1>${otp}</h1>
      `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                return res.send({ Status: "Success" });
            }
        });

        const agency = await userCollection.insertOne(newAgency);
        res.status(201).json(agency);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//admin added agent
router.post("/agent", async (req, res) => {
    try {
        const { name, email, password, agencyName } = req.body;
        console.log(name, email, password, agencyName);

        const existingAgent = await userCollection.findOne({ email: email });
        console.log("emmail", existingAgent);
        if (existingAgent) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAgent = {
            name,
            email,
            password: hashedPassword,
            termsAndcondition: true,
            verification: false,
            otp,
            agencyName,
            role: "agent",
            photoURL: "",
            about: "",
            location: "",
        };

        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "algobot701@gmail.com",
                pass: "jfth qddl nkgp yitb",
            },
        });

        var mailOptions = {
            from: '"Fred Foo 👻"',
            to: email,
            subject: "Email Verification",
            text: "Confirmation email",
            html: `
          <b>Hello ${name}. Please confirm your otp.</b>
          <b>Your confirmation code is</b>
          <h1>${otp}</h1>
      `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                return res.send({ Status: "Success" });
            }
        });

        const agent = await userCollection.insertOne(newAgent);
        res.status(201).json(agent);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//----------------------- PUT -----------------//
// Update Profile
router.put("/update/:email", upload.single("images"), async (req, res) => {
    try {
        const email = req.params.email;
        const {
            name,
            password,
            about,
            role,
            commissionAmount,
            location,
            oldPass,
            isUpdate,
        } = req.body;

        const filename = req.file ? req.file.filename : undefined;
        const newPassword = password ? password : undefined;

        // Retrieve existing user data
        const existingUser = await userCollection.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found." });
        }
        const paths = "http://localhost:5000/image/areas/";
        const userToUpdate = {
            name,
            about,
            location,
        };
        if (req.body.commissionAmount) {
            userToUpdate.commissionAmount = req.body.commissionAmount;
        }
        if (isUpdate == "False" && newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            userToUpdate.password = hashedPassword;
        } else if (isUpdate == "True") {
            userToUpdate.password = oldPass;
        }
        // Update fields provided in the request body
        if (filename) userToUpdate.photoURL = paths + filename;

        // Update user data in the database
        const result = await userCollection.updateOne(
            { email },
            { $set: userToUpdate }
        );

        const user = await userCollection.findOne({ email });

        const token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ token, user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.put("/admin/Update/:id", upload.single("images"), async (req, res) => {
    try {
        const { name, email, password, oldPass, isUpdate } = req.body;
        const id = req.params.id;
        const filename = req.file ? req.file.filename : undefined;
        const newPassword = password ? password : undefined;

        const existingUser = await userCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found." });
        }

        const paths = "http://localhost:5000/image/areas/";

        const newAgency = {
            name,
            email,
        };
        if (isUpdate == "False" && newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            newAgency.password = hashedPassword;
        } else if (isUpdate == "True") {
            newAgency.password = oldPass;
        }

        if (filename) newAgency.photoURL = paths + filename;

        const result = await userCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: newAgency }
        );

        res.status(201).json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//---------------------------------------------//

//----------------------- DELETE -----------------//
// Delete User
router.delete("/user/delete/:email", async (req, res) => {
    try {
        const userEmail = req.params.email;
        if (!userEmail) {
            return res
                .status(400)
                .json({ error: "Email parameter is missing." });
        }

        // Find the user by email to get their role
        const user = await userCollection.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Delete the user from the users collection
        const query = { email: userEmail };
        const result = await userCollection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
router.delete("/admin/delete/:email", async (req, res) => {
    try {
        const userEmail = req.params.email;
        if (!userEmail) {
            return res
                .status(400)
                .json({ error: "Email parameter is missing." });
        }

        // Find the user by email to get their role
        const user = await userCollection.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Delete the user from the users collection
        const query = { email: userEmail };
        const result = await userCollection.deleteOne(query);

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});
//------------------------------------------------//

//----------------------- Password Reset + otp-----------------//
// Password Reset
router.post("/forgot-password/:email", async (req, res) => {
    const userEmail = req.params.email;

    try {
        const user = await userCollection.findOne({ email: userEmail });
        if (!user) {
            return res.send({ Status: "User not existed" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "algobot701@gmail.com",
                pass: "fvpj cgjn kbim mvgy",
            },
        });

        var mailOptions = {
            from: "algobot701@gmail.com",
            to: user.email,
            subject: "Reset Password Link",
            text: `http://localhost:5173/reset_password/${user._id}/${token}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                return res.send({ Status: "Success" });
            }
        });
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).send({ Status: "Error" });
    }
});
router.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.json({ Status: "Error with token" });
        }

        // Hash the new password
        const hash = await bcrypt.hash(password, 10);

        // Update the user's password
        const result = await userCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { password: hash } }
        );

        if (result.modifiedCount === 1) {
            // Password updated successfully
            return res.send({ Status: "Success" });
        } else {
            // No document was modified (no user found with the provided ID)
            return res.status(404).json({ Status: "User not found." });
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).send({ Status: "Error" });
    }
});
// !------------OTP Verification----------
router.post("/otp-verification", async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await userCollection.findOne({ otp });
        if (!user) {
            return res.status(401).json({ message: 'otp didn"t match' });
        }
        const result = await userCollection.updateOne(
            { _id: user._id },
            { $set: { verification: true } }
        );
        return res.status(200).json({
            message: "successfully verify email. have a good day",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
});
//-------------------------------------------------------//

//----------------------- Pending -----------------//
//-----------------------------------------------//

module.exports = router;
