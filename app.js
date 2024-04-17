const express = require("express");
const multer = require("multer");
const cmd = require("node-cmd");
const bodyParser = require("body-parser");
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();

const CATERcmd = `sh ~/Documents/CATER/simulate_cater.sh -f cat.mp4 -d ~/Documents/uploadapp/results/`;

// Setup multer storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Upload middleware
const upload = multer({ storage: storage });

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/upload", upload.single("videoFile"), (req, res) => {
    res.json({ message: "Thank you for your submission!" });
    cmd.run(`sh ~/Documents/CATER/simulate_cater.sh`, (err, data, stderr) => {
        console.log("Current dir: ", data);
    });
});

app.listen(port, () => console.log(`Server started on port ${port}`));