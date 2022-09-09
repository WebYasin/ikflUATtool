'use strict';

const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: JSON.parse(process.env.MAIL_SECURE_CONNECTION),
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    }
});

async function sendMail(to, subject, body, cc = [], from = null, attachments = []) {
    const mailOptions = {
        from: from || process.env.MAIL_FROM,
        to: to,
        title:  'IKFL KISAN FINANCE',
        subject: subject,
        html: body
    };

    if (cc && cc.length) mailOptions.cc = cc;
    if (attachments && attachments.length) mailOptions.attachments = attachments;

    return new Promise(resolve => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) resolve({ error });
            resolve({success: info});
        });
    });
}

module.exports.sendMail = sendMail;