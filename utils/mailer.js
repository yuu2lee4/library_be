import * as nodemailer from "nodemailer";
import config from "config";

export default nodemailer.createTransport(config.get('mail'));
