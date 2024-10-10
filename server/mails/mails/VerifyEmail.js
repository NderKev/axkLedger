const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
//const link = `http://102.133.149.187/backend/verify/:token`
const VerifyMailContent = (link) => `
${ContentBlock(
  `${Text(
    'Verify Your Afrikabal Account Email!',
  )}`,
)}
${ContentBlock(`${Text("You've successfully created an afrikabal account using this email. " +
  "Click the button below to verify your email. ")}`)}
${Button('Verify Email', link)}
`;

module.exports = VerifyMailContent;
