exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_send_btc', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.string('from');
        table.float('amount', 10, 5).unsigned();
        table.string('to');
        table.integer('index').unsigned();
        table.string('wif').unique();
        table.string('address').unique();
        table.string('rawTx').unique();
        table.string('txHash').unique();
        table.enum('status',['decoded', 'pushed', 'pending', 'complete'])
        table.timestamps();
      })
    ])
  };
  //Rollback migration
  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_send_btc')
    ])
  };