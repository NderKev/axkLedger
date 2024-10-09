const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');
const TransactionMailContent = require('./mails/TransactionMail');
const VerifyMailContent = require('./mails/VerifyEmail');
const ResetPasswordEmailContent = require('./mails/ResetPasswordEmail');

const WelcomeMail = (username = '{{nickname}}', link) => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to axkledger !',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to axkledger and thank you for registering to our service!\n\ Access now: https://www.axkl.org \n\nEnjoy using on our platform!\n\nThe axkledger  Team
    `)(username),
  html: ((username, link) =>
    `${MainLayout(
      'Welcome to axkledger ',
      username,
      WelcomeMailContent(link),
    )}`)(username, link),
});

module.exports = {
  WelcomeMail,
};
