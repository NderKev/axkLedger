exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_xrp', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('pubKey').unique();
        table.string('privKey').unique();
        table.integer('index').unsigned();
        table.string('address').unique();
        table.integer('balance').unsigned();
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_xrp')
    ])
  };