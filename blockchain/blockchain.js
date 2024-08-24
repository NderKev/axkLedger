'use strict';

require('dotenv').config({ path: '../.env'});

//dotenv.config();

const http = require('http');
const port = process.env.SRV_PORT || '4055';

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

