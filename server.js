'use strict';

require('dotenv').config();
const http = require('http');
const port = process.env.SRV_PORT || '4050';

const app = require('./app');

app.set('port', port);

const server = http.createServer(app);

server.listen(port);

server.on('error', (error) => {
  console.error('error found', error)
});

server.on('listening', () => {
  console.log('Server running at ', port)
});

