const mailer = require("nodemailer");

/**
 * @typedef {Object} MailerSettings
 * @property {mailer.Transporter<SMTPTransport.SentMessageInfo>} transporter NodeMailer transport object
 * @property {Object} mailOptions Options for email payload
 */

/**
 * Creates nodemailer settings based on information provided through the CATER upload portal. Does not actually send mail.
 * 
 * @param {string} recipient Valid email address to receive the email. Should be the same email that was granted access to the Google Drive file
 * @param {string} link Link to Google Drive file
 * @returns {MailerSettings} Settings for email
 */
function generateMail(recipient, link) {

    console.log("Generating email transporter...");
    const transporter = mailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.APP_PASS
        }
    });

    console.log("Generating email payload settings...");
    const mailOptions = {
        from: {
            name: "CATER",
            address: process.env.SENDER_EMAIL,
        },
        to: [recipient],
        subject: "CATER has processed your video!",
        text: `The video you uploaded to CATER has been processed and is ready to download here: ${link}`
    };

    return {
        transporter: transporter,
        mailOptions: mailOptions
    };
};

module.exports = { generateMail }