// Require necessary packages
const express = require("express");
const multer = require("multer");
const shell = require("shelljs");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

// Initialise port value and app object
const port = process.env.PORT || 3000;
const app = express();

// CATER CLI settings
const CATER_PATH = "/home/cater/CATER/build/external/Build/cater/ui/cli/cater-cli";
const FRAMERATE = 1;

// Google API settings
const AUTH = require("./auth/auth.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Create auth client
const client = new google.auth.JWT(AUTH.client_email, AUTH.private_key, null, SCOPES);

const drive = google.drive({ version: "v3", client });

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

app.post("/upload", upload.single("videoFile"), (req, res) => {
    res.json({ message: "Thank you for your submission!" });

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

    try {
        // FFMPEG - Chop video into frames
        if (shell.exec(`ffmpeg -i ${updir}/${req.file.filename} -r ${FRAMERATE} ${resdir}/frames/frame%d.png`).code !== 0) {
            throw new Error("Error creating video frames!");
        }
        console.log(`FFMPEG frames in: ${resdir}/frames`);

        // CATER - initialise process
        if (shell.exec(`${CATER_PATH} init ${resdir}/frames`).code !== 0) {
            throw new Error("Error initialising CATER environment!");
        }

        // CATER - do tracking
        if (shell.exec(`${CATER_PATH} track ${resdir}/frames_output/now/results.yml`).code !== 0) {
            throw new Error("Error calculating CATER unaries!");
        }

        // FFMPEG - turn unaries into video
        if (shell.exec(`ffmpeg -framerate ${FRAMERATE} -i ${resdir}/frames_output/now/unaries/frame%d-unary.png -c:v libx264 -r ${FRAMERATE} ${resdir}/unary_video/${nameNoExt}_result.mp4`).code !== 0) {
            throw new Error("Error compiling unaries into video file!");
        }

        // driveUpload(authorise(), `${resdir}/unary_video/${nameNoExt}_result.mp4`);
    } catch (error) {
        console.error(error);
    }
});

app.listen(port, () => console.log(`Server started on port ${port}`));