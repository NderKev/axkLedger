const Link = require('../components/Link');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
//const link = `http://102.133.149.187/backend/verify/:token`
const ResetPasswordEmailContent = (link) => `
${ContentBlock(
  `${Text(
    'Reset Your Password For Afrikabal Account ✔',
  )}`,
)}
${ContentBlock(`${Text('Please follow the link below to reset your afrikabal account password')}`)}
${Link('Click here to reset your password!', link)}
`;

module.exports = ResetPasswordEmailContent;