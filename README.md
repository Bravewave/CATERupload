# CATERupload
This is a repository for my 3rd year dissertation project, as part of my MComp degree. The code within is for a web portal, allowing users to upload a video file to a remote server which runs that video through various command line processes, then returns the processed video to the user via a Google Drive upload, with a confirmation email.

## Project Background
CATER (Combined Animal Tracking & Environment Reconstruction) is a computer vision framework developed by collaborators at Munster University and the University of Sheffield with the goal of facilitating small animal tracking. Given a top-down video of a moving subject against a complex background, it both calculates a trajectory for that object through the use of unaries as well as creating a mosaic from the video frames to match that trajectory.

The software is designed by computer scientists to solve a technical problem and as a result its barrier to entry limits its appeal to its target audience (that being researchers and scientists in the field, as well as roboticists). This project is a proof-of-concept showing that it is possible to employ a remote solution for interfacing with the CATER software, thereby making it a far more widely accessible tool.

More information can be found on CATER's [GitHub repository](https://github.com/LarsHaalck/CATER) and [its paper](https://www.science.org/doi/10.1126/scirobotics.adg3679) in Science Advances journal.

## Prerequisites

This implementation has been built and tested on Ubuntu 22.04 Jammy Jellyfish, and while alternative versions of it *may* work, the Ubuntu operating system is required for operation. You must be running Node.js v20.6.0 or higher, have installed FFMPEG, and have installed CATER via the instructions in the repo linked above.

## Project Hierarchy

The project consists of 4 main directories: the root directory, where the app entry point, Git files and required NPM package files are stored; `public/`, where the static frontend pages are stored; `uploads/`, an (initally) empty directory in which the app will store uploaded videos; and `util/` where all helper functionality is neatly abstracted away for readability and ease of editing.

### cli.js
Deals with all command line interfacing, using [ShellJS](https://www.npmjs.com/package/shelljs). The user's video must first be processed by FFMPEG, then by CATER.

### drive.js
Deals with Google Drive authentication and uploading using [googleapis](https://www.npmjs.com/package/googleapis). This requires a JWT (JSON Web Token) auth file - see below for details.

### mail.js
Deals with sending the confirmation email using [nodemailer](https://www.nodemailer.com/). This requires the generation of an App Password for the sender's Google Account - see below for details.

## Missing Files

### Google JWT Authentication
This project uses JWT authentication for Google APIs. For obvious reasons, the token used for the project is not stored in this repository. If cloning this project, one ought to be generated using the [Google Cloud Console](https://console.cloud.google.com), the JSON file renamed to `auth.json`, and that file placed within a directory at the root level named `auth/`.

### Environment Variables
This project uses envionment variables to store sensitive information for use with nodemailer, as well as settings such as CLI paths and Google Auth Scopes. Create a `.env` file in the `util/` directory and fill it as shown:

```
CATER_PATH=<path to your CATER CLI>
SCOPES=https://www.googleapis.com/auth/drive.file
DEST=<ID of Google Drive folder to upload to>
SENDER_EMAIL=<your email>
APP_PASS=<app password generated from your Google account settings>
```

Thanks to native .env support introduced in Node v20.6.0, `npm run start` will then run the application, passing the environment variable file as an argument.
