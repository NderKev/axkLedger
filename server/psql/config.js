const dotenv = require('dotenv');
//dotenv.config({ path: '../../.env'});
//dotenv.config({ path: './local.env'});
//Load env vars if env is not production

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './local.env'});
}

module.exports = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET,
  ADM_SECRET: process.env.ADM_SECRET,
  FRM_SECRET: process.env.FRM_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV,
  JWT_TOKEN_EXPIRES_IN: 3600000 * 24,
  JWT_ADM_EXPIRES_IN: 3600000 * 12,
  JWT_FARMER_EXPIRY: 3600000 * 48,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PW: process.env.SMTP_PW,
  INITIAL_BAL: 0,
  FROM_NAME: 'Verification',
  FROM_EMAIL: process.env.SMTP_USER,
  SUPPORT_USER: process.env.SUPPORT_USER,
  SUPPORT_PW: process.env.SUPPORT_PW,
  SUPPORT_EMAIL: process.env.SUPPORT_USER,
  SUPPORT_NAME: 'Support'
};