const config = require('../config');
const pg = require('knex')({
    client: 'pg',
    connection: {
      //connectionString: config.DATABASE_URL,
      host: config['DB_HOST'],
      port: config['DB_PORT'],
      user: config['DB_USER'],
      database: config['DB_NAME'],
      password: config['DB_PASS']
     // ssl: config['DB_SSL'] ? { rejectUnauthorized: false } : false,
    },
  });