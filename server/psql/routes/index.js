const configureRoutes = (app) => {
    app.use('/axkledger/v1/api/auth', require('./api/auth'));
    app.use('/axkledger/v1/api/admin', require('./api/admin'));
    app.use('/axkledger/v1/api/users', require('./api/users'));
    //app.use('/axkledger/v1/api/mails', require('./api/mails'));
    app.use('/axkledger/v1/api/wallet', require('./api/wallet'));
    //app.use('/axkledger/v1/api/tx', require('./api/transaction'));
    //app.use('/axkledger/v1/api/video', require('./api/video'));
    app.use('/', (req, res) => {
      res.status(200).send('Welcome to axkledger!');
    });
  };
  
  module.exports = configureRoutes;