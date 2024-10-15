//const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
const Link = require('../components/Link');
//const link = `http://102.133.149.187/backend/verify/:token`
const WalletMailContent = (link, crypto, address) => `
${ContentBlock(
  `${Text(
    "Afrikabal " + crypto +  "wallet successfully created",
)}`
)}
${ContentBlock(`
    ${Text(
    'Your have successfully created a ' +  crypto + ' wallet and your address is' + address +'! .', 
    '\n Verify it status on blockchain from the link below.',
    )}
    `)}
${Link('Verify Address', link)}
`;

module.exports = WalletMailContent;