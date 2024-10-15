const Button = require('../components/Button');
//${Button('Verify now!', link)}
const ContentBlock = require('../components/ContentBlock');
const Text = require('../components/Text');
//const link = `http://102.133.149.187/backend/verify/:token`
const WelcomeMailContent = (link , otp) => `
${ContentBlock(
  `${Text(
    'Welcome to afrikabal and thank you for registering to our service!',
  )}`,
)}
${ContentBlock(`
  ${Text(
  'Verify your email using the otp below : \n' + otp + '\n or use the magic link below',  
  )}
  `)}
${Button('Verify now!', link)}
${ContentBlock(`${Text('Enjoy selling and tracking agricultural products on our platform!')}`)}
`;

module.exports = WelcomeMailContent;
