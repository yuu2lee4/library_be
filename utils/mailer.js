const nodemailer = require('nodemailer');
const config = require('../config/mail')

module.exports = nodemailer.createTransport(config);