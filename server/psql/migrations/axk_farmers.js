exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_sc_farmers', function (table) {
        table.increments().primary();
        table.string('wallet_id').unique().notNullable();
        table.string('address').unique().notNullable();
        table.string('name').notNullable();
        table.string('location').notNullable();
        table.string('private_key').unique().notNullable();
        table.string('public_key').unique().notNullable();
        table.string('key').unique().notNullable();
        table.tinyint('verified').unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_sc_farmers')
    ])
  };