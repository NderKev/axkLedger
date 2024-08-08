const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');

const WelcomeMailContent = () => `
${ContentBlock(
  `${Text(
    'Welcome to Decplmax Version One and thank you for registering to our service!',
  )}`,
)}
${Button('Play now!', '')}
${ContentBlock(`${Text('Enjoy advertising on our platform!')}`)}
`;

module.exports = WelcomeMailContent;
