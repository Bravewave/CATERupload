const express = require("express");
const multer = require("multer");
const cmd = require("node-cmd");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

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

app.post("/upload", upload.single("videoFile"), (req, res) => {
    res.json({ message: "Thank you for your submission!" });

    // Remove extension in folder name
    const nameNoExt = req.file.filename.substring(0, req.file.filename.lastIndexOf(".")) || req.file.filename;
    // Path to store FFMPEG frames
    const resdir = path.join(__dirname, "results", nameNoExt);
    // Path to uploaded video
    const updir = path.join(__dirname, "uploads");

    // If dir does not yet exist, create it
    if (!fs.existsSync(resdir)) {
        fs.mkdirSync(resdir);
    }

    console.log(`File uploaded to: ${updir}/${req.file.filename}`);

    cmd.run(`ffmpeg -i ${updir}/${req.file.filename} -r ${framerate} ${resdir}/frame%d.png`, (err, data, stderr) => {
        console.log(data);
    });

    console.log(`FFMPEG frames in: ${resdir}`);
});

app.listen(port, () => console.log(`Server started on port ${port}`));