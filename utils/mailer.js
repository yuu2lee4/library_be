const nodemailer = require('nodemailer');
const config = require('config');

module.exports = nodemailer.createTransport(config.get('mail'));