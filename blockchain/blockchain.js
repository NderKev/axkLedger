'use strict';

const config = require('./config');

const http = require('http');
const port = config.PORT || '4055';

const app = require('./app');

app.set('port', port);

const blockchain = http.createServer(app);

blockchain.listen(port);

blockchain.on('error', (error) => {
  console.error('error found', error);
});

blockchain.on('listening', () => {
  console.log('Blockchain Server running at :', port);
});

