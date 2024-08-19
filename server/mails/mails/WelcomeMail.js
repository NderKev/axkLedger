const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');

const WelcomeMailContent = () => `
${ContentBlock(
  `${Text(
    'Welcome to axkledger and thank you for registering to our service!',
  )}`,
)}
${Button('Access now!', '')}
${ContentBlock(`${Text('Enjoy selling and tracking agricultural products on our platform!')}`)}
`;

module.exports = WelcomeMailContent;
