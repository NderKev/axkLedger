const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');

const WelcomeMail = (username = '{{nickname}}') => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to Decplmax !',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to Decplmax  and thank you for registering to our service!\n\nPlay now: https://www.vintagepoker.net \n\nEnjoy playing on our platform!\n\nThe Decplmax  Team
    `)(username),
  html: ((username) =>
    `${MainLayout(
      'Welcome to Decplmax ',
      username,
      WelcomeMailContent(),
    )}`)(username),
});

module.exports = {
  WelcomeMail,
};
