const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');

const WelcomeMail = (username = '{{nickname}}') => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to axkledger !',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to axkledger and thank you for registering to our service!\n\Acces now: https://www.axkl.org \n\nEnjoy using on our platform!\n\nThe axkledger  Team
    `)(username),
  html: ((username) =>
    `${MainLayout(
      'Welcome to axkledger ',
      username,
      WelcomeMailContent(),
    )}`)(username),
});

module.exports = {
  WelcomeMail,
};
