const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');
const TransactionMailContent = require('./mails/TransactionEmail');
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

const TransactionMail = (username, link, amount, crypto, address) => ({
  id: 2,
  name: '002 | Transaction Sent',
  subject: 'Transaction sent from Wallet !',
  text: ((username, amount, crypto, address) =>
    `Hi ${username} Yout transaction of ${crypto} ${amount} has been sent to ${address}
    `)(username, amount, crypto, address),
  html: ((username, link, amount, crypto, address) =>
    `${MainLayout(
      'Transaction sent from your wallet',
      username,
      TransactionMailContent(link, amount, crypto, address),
    )}`)(username, link, amount, crypto, address),
});

module.exports = {
  WelcomeMail,
  TransactionMail
};
