exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_users', function (table) {
        table.increments().primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('pin').unique();
        table.string('wallet_id').unique().notNullable();
        table.tinyint('kyc').unsigned();
        table.tinyint('verified_email').unsigned();
        table.string('latitude');
        table.string('longitude');
        table.tinyint('flag').unsigned();
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_users')
    ])
  };