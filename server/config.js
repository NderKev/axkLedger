const dotenv = require('dotenv');

// Load env vars if env is not production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './local.env'});
}

module.exports = {
  PORT: process.env.PORT || 7000,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URI: process.env.DATABASE_URI,
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
