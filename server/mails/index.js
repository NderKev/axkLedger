const MainLayout = require('./layout/MainLayout');
const WelcomeMailContent = require('./mails/WelcomeMail');
const TransactionMailContent = require('./mails/TransactionEmail');
const VerifyMailContent = require('./mails/VerifyEmail');
const WalletMailContent = require('./mails/WalletEmail');
const ResetPasswordEmailContent = require('./mails/ResetPasswordEmail');

const WelcomeMail = (username = '{{nickname}}', link) => ({
  id: 1,
  name: '001 | Registration Welcome',
  subject: 'Welcome to afrikabal',
  text: ((username) =>
    `Hi ${username}!\n\nWelcome to afrikabal and thank you for registering to our service!\n\ Access now: https://www.axkl.org \n\nEnjoy using on our platform!\n\nThe afrikabal  Team
    `)(username),
  html: ((username, link) =>
    `${MainLayout(
      'Welcome to Afrikabal',
      username,
      WelcomeMailContent(link),
    )}`)(username, link),
});

const TransactionMail = (username, link, amount, crypto, address) => ({
  id: 2,
  name: '002 | Transaction Sent',
  subject: `${crypto} transaction sent from your wallet`,
  text: ((username, amount, crypto, address) =>
    `Hi ${username} \n\nYour transaction of ${crypto} ${amount} has been successfully sent to ${address}
    `)(username, amount, crypto, address),
  html: ((username, link, amount, crypto, address) =>
    `${MainLayout(
      `${amount} usd of ${crypto} sent from your wallet`,
      username,
      TransactionMailContent(link, amount, crypto, address),
    )}`)(username, link, amount, crypto, address),
});

const WalletMail = (username, link, crypto, address) => ({
  id: 3,
  name: '003 | Wallet created',
  subject:`A New ${crypto} Wallet Address Created`,
  text: ((username, crypto, address) =>
    `Hi ${username} \n\nA new ${crypto} wallet has been created successfully whose initial your address is ${address}
    `)(username, crypto, address),
  html: ((username, link, crypto, address) =>
    `${MainLayout(
      `${crypto} wallet address created`,
      username,
      WalletMailContent(link, crypto, address),
    )}`)(username, link, crypto, address),
});

const VerifyMail = (username = '{{nickname}}', link) => ({
  id: 4,
  name: '004 | Verify Email',
  subject: 'Verify your Email',
  text: ((username) =>
    `Hi ${username}!\n\n Thanks for adding this email to your afrikabal account. Please follow instructions below to verify it and activate it on our platform !\n\ Access now: https://www.axkl.org \n\nEnjoy using on our platform!\n\nThe Afrikabal Team
    `)(username),
  html: ((username, link) =>
    `${MainLayout(
      'Verify Your Email On Afrikabal ',
      username,
      VerifyMailContent(link),
    )}`)(username, link),
});

const ResetPasswordMail = (username = '{{nickname}}', link) => ({
  id: 5,
  name: '005 | Reset Password',
  subject: 'Reset your Password',
  text: ((username) =>
    `Hi ${username}!\n\n Please follow instructions below to reset your password for your afrikabal account. !\n\ Access now: https://www.axkl.org \n\nEnjoy using on our platform!\n\nThe Afrikabal Team
    `)(username),
  html: ((username, link) =>
    `${MainLayout(
      'Reset Your Afrikabal Account Password',
      username,
      ResetPasswordEmailContent(link),
    )}`)(username, link),
});


module.exports = {
  WelcomeMail,
  TransactionMail,
  WalletMail,
  VerifyMail,
  ResetPasswordMail
};
