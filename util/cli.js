const shell = require("shelljs");

// CATER CLI settings
const CATER_PATH = "/home/cater/CATER/build/external/Build/cater/ui/cli/cater-cli";

/**
 * 
 * @param {string} source 
 * @param {string} filename 
 * @param {number} framerate 
 * @param {string} destination 
 * @returns {string} Path of result video
 */
function processVideo(source, filename, framerate, destination, nameNoExt){
    try {
        // FFMPEG - Chop video into frames
        if (shell.exec(`ffmpeg -i ${source}/${filename} -r ${framerate} ${destination}/frames/frame%d.png`).code !== 0) {
            throw new Error("Error creating video frames!");
        }
        console.log(`FFMPEG frames in: ${destination}/frames`)

        // CATER - initialise process
        if (shell.exec(`${CATER_PATH} init ${destination}/frames`).code !== 0) {
            throw new Error("Error initialising CATER environment!");
        }

        // CATER - do tracking
        if (shell.exec(`${CATER_PATH} track ${destination}/frames_output/now/results.yml`).code !== 0) {
            throw new Error("Error calculating CATER unaries!");
        }

        // FFMPEG - turn unaries into video
        if (shell.exec(`ffmpeg -framerate ${framerate} -i ${destination}/frames_output/now/unaries/frame%d-unary.png -c:v libx264 -r ${framerate} ${destination}/unary_video/${nameNoExt}_result.mp4`).code !== 0) {
            throw new Error("Error compiling unaries into video file!");
        }
        
        console.log(`Result video saved in ${destination}/unary_video/${nameNoExt}_result.mp4`);
        return `${destination}/unary_video/${nameNoExt}_result.mp4`;
    } catch (error) {
        console.error(error);
    }
};

module.exports = { processVideo };