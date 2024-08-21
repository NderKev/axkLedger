exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_btc', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('wif').unique();
        table.string('address').unique();
        table.integer('index').unsigned();
        table.string('xpub').unique();
        table.string('xpriv').unique();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_btc')
    ])
  };