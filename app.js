// Require necessary packages
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// Require helper functions from util files
const { processVideo } = require("./util/cli");
const { driveUpload } = require("./util/drive");
const { generateMail } = require("./util/mail");

// Initialise port value and app object
const port = process.env.PORT || 3000;
const app = express();

const framerate = 24;

// Setup multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// File upload middleware
const upload = multer({ storage: storage });

// Static file delivery
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", upload.single("videoFile"), async (req, res) => {
    res.json({ message: "Thank you for your submission! You will receive an email with a link to the processed video soon!" });

    console.log("\n\n===== BEGIN SUBMISSION PREPROCESSING =====\n\n");

    // Remove extension in folder name
    const nameNoExt = req.file.filename.substring(0, req.file.filename.lastIndexOf(".")) || req.file.filename;
    // Path to store FFMPEG frames
    const resdir = path.join(__dirname, "results", nameNoExt);
    // Path to uploaded video
    const updir = path.join(__dirname, "uploads");

    // If dirs do not yet exist, create them
    if (!fs.existsSync(updir)) {
        fs.mkdirSync(`${updir}`);
    }

    if (!fs.existsSync(resdir)) {
        fs.mkdirSync(`${resdir}/frames`, { recursive: true });
        fs.mkdirSync(`${resdir}/unary_video`, { recursive: true });
    }

    console.log(`File uploaded to: ${updir}/${req.file.filename}`);

    console.log("\n\n===== BEGIN VIDEO PROCESSING =====\n\n");

    const result = processVideo(updir, req.file.filename, framerate, resdir, nameNoExt);

    console.log("\n\n===== BEGIN GOOGLE DRIVE UPLOAD =====\n\n");

    try {
        const url = await driveUpload(result, req.body.email);
        console.log("File uploaded at:", url);

        console.log("\n\n===== BEGIN EMAIL =====\n\n");

        const { transporter, mailOptions } = generateMail(req.body.email, url);

        try {
            console.log("Attempting to send email...");
            transporter.sendMail(mailOptions);
            console.log("Email sent successfully!");
            console.log("\n\n===== !!!SUCCESS!!! =====\n\n");
        } catch (err) {
            console.error("Error with email:", err);
            return;
        }
    } catch (err) {
        console.error("Error with Google Drive upload process:", err);
    }
});

app.listen(port, () => console.log("Server started on port:", port));