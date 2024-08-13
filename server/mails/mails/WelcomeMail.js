const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');

const WelcomeMailContent = () => `
${ContentBlock(
  `${Text(
    'Welcome to axkledger Version One and thank you for registering to our service!',
  )}`,
)}
${Button('Access now!', '')}
${ContentBlock(`${Text('Enjoy advertising on our platform!')}`)}
`;

module.exports = WelcomeMailContent;
