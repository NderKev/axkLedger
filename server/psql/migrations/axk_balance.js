exports.up = function (knex) {
    return Promise.all([
      knex.schema.createTable('axk_balance', function (table) {
        table.increments().primary();
        table.string('wallet_id').index().references('wallet_id').inTable('axk_users').onDelete('restrict').onUpdate('cascade');
        table.enum('crypto',['axk', 'btc', 'eth', 'lisk', 'usdc', 'usdt', 'xrp'])
        table.string('address').unique().notNullable();
        table.float('balance', 10, 5).unsigned();
        table.float('usd', 10, 5).unsigned();
        table.enum('status',['complete', 'pending', 'refunded', 'failed']);
        table.timestamps();
      })
    ])
  };

  exports.down = function (knex) {
    return Promise.all([
      knex.schema.dropTable('axk_balance')
    ])
  };