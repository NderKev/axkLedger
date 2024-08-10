'use strict';

// require('dotenv').config();
const http = require('http');
const port = 5050;

const axkXrp = require('./axkXrp');

axkXrp.set('port', port);

const server = http.createServer(axkXrp);

server.listen(port);

server.on('error', (error) => {
  console.error('error found', error)
});

server.on('listening', () => {
  console.log('Server running at ', port)
});

