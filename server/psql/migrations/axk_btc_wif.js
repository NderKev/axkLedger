exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_btc_wif', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('wif').unique().notNullable();
        table.string('address').unique().notNullable();
        table.integer('index').unsigned().notNullable();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_btc_wif')
    ])
  };