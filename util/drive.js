const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const AUTH = require("../auth/auth.json");

const gAuth = new google.auth.JWT(AUTH.client_email, null, AUTH.private_key, [process.env.SCOPES]);
const drive = google.drive({ version: "v3", gAuth });

/**
 * Uploads a file to a pre-determined Google Drive folder and grants a third party read access to that file
 * 
 * @param {string} filepath Absolute path to desired file
 * @param {string} email Valid email address of user to be granted access to file
 * @returns {Promise<string>} Sharing URL of file
 */
async function driveUpload(filepath, email) {
    try {
        await new Promise((resolve, reject) => {
            gAuth.authorize((err, tokens) => {
                if (err) {
                    console.error("Error with Google authorisation!\n", err);
                    reject(err);
                } else {
                    console.log("Google authorisation successful!");
                    console.log("Credentials:", tokens);
                    resolve(tokens);
                }
            });
        });
    
        console.log("Service account authorisation successful, beginning upload...");
        const fileStream = fs.createReadStream(filepath);
        const response = await drive.files.create({
            auth: gAuth,
            requestBody: {
                name: path.basename(filepath),
                parents: [process.env.DEST]
            },
            media: {
                mimeType: "video/mp4",
                body: fileStream
            }
        });
    
        console.log("File upload successful, sharing file...");
        console.log("Google Drive file ID:", response.data.id);
        drive.permissions.create({
            fileId: response.data.id,
            auth: gAuth,
            requestBody: {
                role: "reader",
                type: "user",
                emailAddress: email
            }
        });
    
        console.log("File uploaded and shared successfully!");
        return `https://drive.google.com/file/d/${response.data.id}/view?usp=drive_link`;
    } catch (err) {
        console.error("Error uploading file: ", err);
        return "ERROR";
    }
};

module.exports = { driveUpload };