const dotenv = require('dotenv');
dotenv.config({ path: '../.env'});
//dotenv.config({ path: './local.env'});
//Load env vars if env is not production

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './local.env'});
}

module.exports = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 24,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PW: process.env.SMTP_PW,
  INITIAL_BAL: 0,
  FROM_NAME: '',
  FROM_EMAIL: '',
};