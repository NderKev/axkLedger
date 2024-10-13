//const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
const Link = require('../components/Link');
//const link = `http://102.133.149.187/backend/verify/:token`
const DepositMailContent = (link, amount, crypto, address) => `
${ContentBlock(
  `${Text(
    "Top up of " + amount + " " + crypto + "successfully deposited to your account",
)}`
)}
${ContentBlock(`
  ${Text(
  "Your top up of " +  amount + " " + crypto +" has been successfully deposited to " + address + "! .",
  "\n Verify its status on blockchain from the link below.",
    )}`
  )}
${Link('Verify Transaction Details', link)}
`;

module.exports = DepositMailContent;