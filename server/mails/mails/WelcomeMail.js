const Button = require('../components/Button');
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
//const link = `http://102.133.149.187/backend/verify/:token`
const WelcomeMailContent = (link) => `
${ContentBlock(
  `${Text(
    'Welcome to afrikabal and thank you for registering to our service!',
  )}`,
)}
${Button('Verify now!', link)}
${ContentBlock(`${Text('Enjoy selling and tracking agricultural products on our platform!')}`)}
`;

module.exports = WelcomeMailContent;
