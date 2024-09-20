'use strict';
const path = require('path');
const configureRoutes = require('./routes');
const config = require('./config')
const http = require('http');
const port = config.PORT || '8000';

const app = require('./app');

configureRoutes(app);
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(
    `Server is running in ${config.NODE_ENV} mode and is listening on port ${port}...`,
  );
});

server.on('error', (error) => {
  console.error('error found', error);
});

server.on('listening', () => {
  console.log('Blockchain Server running at :', port);
});

